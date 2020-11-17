<template>
  <a-row>
    <common-select-bar
      :select-list="selectList"
      :select-options="selectOptions"
      :left-btn="{ text: '新增模块' }"
      @leftBtnClick="editBlock()"
      @search="getData"
    />
    <common-history
      @close="toggleHistory()"
      @edit="editBlock"
      :visible-index="showHistory"
      :data="history"
      :loading="loadingHistory"
      :columns="[
        {
          title: '名称',
          dataIndex: 'name',
          width: 180,
          align: 'center'
        },
        {
          title: '灰度规则',
          dataIndex: 'grayType',
          width: 100,
          align: 'center'
        },
        {
          title: '缓存时间/s',
          dataIndex: 'cache_time',
          width: 100,
          align: 'center'
        },
        {
          title: '上线时间',
          dataIndex: 'update_time',
          width: 180,
          align: 'center'
        },
        {
          title: '上线人',
          dataIndex: 'editor',
          width: 120,
          align: 'center'
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'operate' },
          width: 120,
          align: 'center',
        },
        {
          slots: { title: 'close' },
          width: 10,
          align: 'right',
        }
      ]"
    />
    <a-table
      row-key="_id"
      style="z-index: 1;"
      :loading="loading"
      :scroll="{ x: 1110 }"
      :pagination="{
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: () => `共${total}条`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20,
        total: total
      }"
      :data-source="list"
      :columns="[
        {
          title: 'ID',
          scopedSlots: { customRender: 'id' },
          fixed: 'left',
          width: 210,
          align: 'center'
        },
        {
          title: '名称',
          dataIndex: 'name',
          width: 180,
          align: 'center'
        },
        {
          title: '上线状态',
          dataIndex: 'status',
          width: 100,
          align: 'center'
        },
        {
          title: '灰度规则',
          dataIndex: 'grayType',
          width: 100,
          align: 'center'
        },
        {
          title: '缓存时间/s',
          dataIndex: 'cache_time',
          width: 100,
          align: 'center'
        },
        {
          title: '更新时间',
          dataIndex: 'update_time',
          width: 190,
          align: 'center'
        },
        {
          title: '更新者',
          dataIndex: 'editor',
          width: 120,
          align: 'center'
        },
        {
          title: '历史',
          scopedSlots: { customRender: 'history' },
          width: 100,
          align: 'center'
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'operate' },
          fixed: 'right',
          width: 150,
          align: 'center'
        }
      ]"
      @change="tableChange"
    >
      <span slot="id" slot-scope="text, record, index">
        <a target="_blank" :href="previewUrl(record._id)">{{ record._id }}</a>
      </span>
      <span slot="history" slot-scope="text, record, index">
        <a @click="toggleHistory(record, index)">{{ (showHistory === index + 1) ? '已展开' : '展开' }}</a>
      </span>
      <span slot="operate" slot-scope="text, record, index" style="font-size: 16px;">
        <a-tooltip placement="top" :title="record.isOnline ? '下线' : '上线'">
          <a-icon
            type="poweroff"
            :style="record.isOnline ? 'color: #52c41a;' : 'color: #f5222d;'"
            @click="postOnlineStatus(record)"
          />
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip placement="top" title="编辑">
          <a-icon type="edit" theme="twoTone" @click="editBlock(record)" />
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip placement="top" title="一键导入">
          <a-icon type="copy" theme="twoTone" @click="editBlock(handleCopyBlock(record))" />
        </a-tooltip>
        <a-divider type="vertical" />
        <preview :id="record._id" :gray="record.gray.type" :list="record.list" @preview="preview">
          <a-tooltip placement="top" :title="record.gray.type === 'NONE' ? '预览': ''">
            <a-icon
              type="eye"
              theme="twoTone"
              @click="record.gray.type === 'NONE' ? preview(record._id) : null"
            />
          </a-tooltip>
        </preview>
      </span>
    </a-table>
    <form-drawer
      :visible="editing"
      :publishing="publishing"
      :block="blockItem"
      :form="form"
      :currentId="currentId"
      :show-history="showHistory"
      @preview="preview"
      @postBlock="postBlock"
      @closeDrawer="editing = false"
      @showConfirm="(showModal = true) && (showConfirm = true) && (showPreview = false)"
    />
    <a-modal v-model="showModal" :title="showConfirm ? '发布确认' : '预览数据'" :width="880" :zIndex="50">
      <a-page-header
        v-if="showConfirm"
        style="padding: 0; margin-bottom: 15px;"
        :title="`${currentId} - ${form.name} 为 线上模块`"
        sub-title="请首先进行对该线上模块进行预览，再执行发布操作"
      />
      <a-row v-if="showPreview" class="center">
        <a-spin v-if="previewLoading" />
        <div v-else>
          <a-list
            :data-source="rtt"
            style="text-align: left; max-height: 180px; overflow-y: auto; margin-bottom: 10px;"
            size="small"
            bordered
          >
            <h4 slot="header">请求耗时</h4>
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-list-item-meta>
                <a slot="title" :href="item.url" target="_blank">{{ item.url.split('?')[0] }}</a>
              </a-list-item-meta>
              <h4>time: {{ item.time }}ms</h4>
            </a-list-item>
          </a-list>
          <a-textarea v-model="previewJson" :rows="22" style="color: #666; word-break: break-all;" disabled />
        </div>
      </a-row>
      <a-row slot="footer" style="text-align: center;">
        <a-button
          v-if="showPreview"
          class="confirm-bottom-btn"
          @click="showModal = false"
        >关闭</a-button>
        <preview
          v-else
          @preview="preview"
          :id="form._id"
          :env="showHistory ? 'ex' : 'preview'"
          :gray="form.gray.type"
          :list="form.list"
        />
        <a-button
          v-if="showConfirm"
          class="confirm-bottom-btn"
          type="primary"
          @click="postBlock"
          :disabled="!(showPreview && !previewLoading)"
          :loading="publishing"
        >{{ showHistory ? '回滚' : '发布' }}</a-button>
      </a-row>
    </a-modal>
  </a-row>
</template>

<script>
import CommonChildTree from '../components/common/childTree'
import CommonSelectBar from '../components/common/selectBar'
import CommonHistory from '../components/common/history'
import FormDrawer from '../components/block/formDrawer'
import Preview from '../components/block/preview'
import { http } from '../utils/http'
import { prefix } from '../utils/block'
import { copyItem, jsonFormat } from '../utils/tool'

let mockData = [{
  "_id":"commonTestData",
  "group":"common",
  "name":"通用测试数据",
  "editor":"jiayanqi",
  "cache_time":0,
  "update_time":new Date(),
  "create_time":new Date(),
  "cache":{ "time":0, "key":[] },
  "chunk":[],
  "list":[{
    "_id":"A",
    "gray":"",
    "api":[{
      "_id":"5f8d9098c8d3634c4097c17e",
      "qipuDataKey":"",
      "qipuIdKey":"",
      "base":{
        "_id":"testApi",
        "name":"测试数据",
        "url":"http://xxx.xxx.xxx",
        "cache":{ "time":0,"key":[] },
        "method":"GET",
        "timeout":3000
      },
      "formater":[{
        "_id":"5f8d9098c8d3634c4097c183",
        "size":0,
        "key":"name",
        "children":[],
        "startIndex":0,
        "order":0,
        "mapping":[{
          "value":"metadata.name",
          "_id":"5f8964a6cdffa61fe3715c4e",
          "required":[],
          "type":"KEY"
        }],
        "type":"String"
      }],
      "headers":[],
      "body":[],
      "params":[],
      "level":"error",
      "required":[]
    }]
  }],
  "gray":{ "type":"NONE" },
  "isOnline":false
}]
const domain = 'xxx'

const apiBlank = [{
  level: 'error',
  required: [],
  formater: []
}] 

const listBlank = [{
  _id: '',
  gray: '',
  api: apiBlank
}]

const cacheBlank = {
  time: 0,
  key: []
}

const formBlank = {
  cache_time: 0,
  cache: cacheBlank,
  gray: { type: 'NONE' },
  isOnline: false,
  chunk: [],
  list: listBlank
}

export default {
  components: {
    CommonSelectBar,
    CommonChildTree,
    CommonHistory,
    FormDrawer,
    Preview
  },
  data() {
    const validateList = (rule, list, callback) => {
      if (list.some(item => !item._id)) {
        callback(new Error('请填写Block ID'))
      } else if (list.some(item => item.api.some(api => !api.base && !api._id))) {
        callback(new Error('请正确选择API'))
      } else if (list.some(item => item.api.some(api => api.formater.some(f => !f.key)))) {
        callback(new Error('请正确填写映射节点'))
      } else {
        callback()
      }
    }
    return {
      // 筛选项数据
      selectList: [
        {
          key: 'isOnline',
          label: '状态',
          defaultValue: '',
          options: [
            {
              key: 1,
              title: '已上线'
            },
            {
              key: 0,
              title: '未上线'
            }
          ]
        },
        {
          key: 'group',
          label: '频道',
          defaultValue: '',
          options: prefix,
          width: '150px'
        }
      ],
      selectOptions: [
        {
          key: '_id',
          title: 'ID'
        },
        {
          key: 'name',
          title: '名称'
        },
        {
          key: 'editor',
          title: '更新者'
        }
      ],
      // 发布确认相关
      showModal: false,
      showConfirm: false,
      showPreview: false,
      previewLoading: false,
      previewJson: '',
      rtt: [],
      // 模块历史数据
      loadingHistory: false,
      showHistory: 0,
      history: [],
      // 模块数据
      loading: false,
      total: 0,
      list: [],
      blockParams: {},
      // 表单数据
      publishing: false,
      editing: false,
      form: formBlank,
      blockItem: {},
      currentId: ''
    }
  },
  mounted() {
    this.getData()
  },
  watch: {
    $route(to) {
      this.getData()
    }
  },
  computed: {
    platform() {
      return this.$route.params.platform
    },
    username() {
      return this.$store.state.user.name
    }
  },
  methods: {
    previewUrl(id) {
      return `http://${domain}/${this.platform}/data/${id}`
    },
    initFormaterHandler(arr = []) {
      arr.map(item => {
        if ((item.children || []).length) {
          if (item.type.includes('A2O')) {
            item.type = 'Parent-A2O'
          } else if (['Array', 'Parent-A'].includes(item.type)) {
            item.type = 'Parent-A'
          } else {
            item.type = 'Parent-O'
          }
          this.initFormaterHandler(item.children)
        }
        item.mapping.map(m => {
          m.type = m.type || 'KEY'
          m.value = `${m.value}`
          m.required = (m.required || []).map(r => {
            r.type = r.type || 'MUST'
            r.variable = (r.variable || []).map(v => {
              v.type = v.type || 'KEY'
              v.field = v.field || 'LOCAL'
              v.operation = v.operation || '!!'
              return v
            })
            return r
          })
          m.kv2v = m.kv2v || {}
        })
        item.type = item.type || 'String'
        item.sort = item.sort || {}
        item.a2o = item.a2o || {}
      })
    },
    initParamsHandler(arr = []) {
      const regex = /_FORMATER$/
      arr.map(param => {
        const { type, from = '', splitKey, multiKey, isFormat } = param
        if (type === 'INHERIT' && !isFormat) {
          param.from = from.replace(regex, '')
          param.isFormat = regex.test(from) ? 1 : 0
          param.inherit = multiKey ? 'multi' : (splitKey ? 'join' : 'single')
        }
      })
    },
    // 一键导入处理
    handleCopyBlock(item) {
      const result = { ...copyItem(item), _id: '' }
      result.list.map(v => v.api.map(api => (api._id = api.base._id) && (delete api.base)))
      return result
    },
    editBlock(item, showHistory) {
      if (item) {
        item.list.map(v => {
          v.api.map((api, index) => {
            api.hasQipu = !!api.qipuIdKey
            api.level = api.level || 'error'
            api.required = api.required || []
            this.initParamsHandler((api.params || []).concat(api.body || []))
            this.initFormaterHandler(api.formater)
          })
        })
        this.currentId = showHistory ? this.list[showHistory - 1]._id : item._id
      } else {
        this.currentId = ''
      }
      this.blockItem = { ...item }
      this.form = copyItem({ ...formBlank, ...item })
      this.editing = true
    },
    async preview(id, env = 'prod', GRAY) {
      this.showModal = true
      this.showPreview = true
      this.previewLoading = true

      // MOCK注释
      // const result = await http(`//${domain}/${this.platform}/data/${id}/${env}`, {
      //   method: 'POST',
      //   params: { GRAY },
      //   data: env === 'preview' ? this.handlePostBlock(true) : {}
      // })
      const result = {};

      if (result.rtt) {
        (this.rtt = result.rtt) && (delete result.rtt)
      }
      this.previewJson = jsonFormat(result)
      this.previewLoading = false
    },
    handlePostFormater(formater) {
      return formater.map(item => {
        let { children = [], mapping = [], type, key, order, sort, a2o, size } = item
        mapping.map(mapItem => {
          if (mapItem.type === 'KV2V') {
            mapItem.required = []
          } else {
            mapItem.kv2v = {}
          }
        });
        let [typeArray, typeParent, typeA2O] = [
          ['Parent-A', 'Array'].includes(type),
          ['Parent-A', 'Parent-O', 'Parent-A2O'].includes(type),
          ['A2O', 'Parent-A2O'].includes(type),
        ]
        if (type === 'Parent-A') {
          type = 'Array'
        } else if (type === 'Parent-O') {
          type = 'Object'
        } else if (type === 'Parent-A2O') {
          type = 'A2O'
        }
        return {
          type,
          key,
          mapping,
          order: typeArray ? order : 0,
          size: typeArray ? size : 0,
          sort: typeArray ? sort : {},
          a2o: typeA2O ? a2o : {},
          children: typeParent ? this.handlePostFormater(children) : []
        }
      })
    },
    handlePostParams(params) {
      return (params || []).map(param => {
        const { type, _id, value, isFormat, from, inherit, multiKey, splitKey, chunkSize } = param
        const result = { type, _id, value, splitKey, multiKey, chunkSize }
        if (type === 'INHERIT') {
          result.from = isFormat ? (from + '_FORMATER') : from
        }
        return result
      })
    },
    handlePostBlock(isPreview) {
      const { _id, name, isOnline, gray, chunk, list, cache } = this.form
      const data = { name, isOnline, gray, chunk, cache, list: copyItem(list), editor: this.username }
      data.list.map(item => {
        item.api = item.api.map((api, index) => {
          const { base, required, level, _id, hasQipu, qipuIdKey, qipuDataKey, headers, params, body, formater } = api
          const result = {
            level,
            base: base ? base._id : _id,
            required: required || [],
            qipuIdKey: hasQipu ? qipuIdKey : '',
            qipuDataKey: hasQipu ? qipuDataKey : '',
            headers: this.handlePostParams(headers),
            params: this.handlePostParams(params),
            body: this.handlePostParams(body),
            formater: this.handlePostFormater(formater)
          }
          if (isPreview) {
            result._id = index
          }
          return result
        })
      })
      return data
    },
    async postBlock() {
      this.publishing = true
      let [data, response] = [this.handlePostBlock(), {}]
      if (this.currentId) {
        // MOCK注释
        // response = await http(`//${domain}/${this.platform}/block/${this.currentId}`, {
        //   method: 'POST',
        //   data
        // })
        mockData = [{ ...data, _id: this.currentId }]
      } else {
        const { prefix = '', _id = '', suffix = '' } = this.form
        // MOCK注释
        // response = await http(`//${domain}/${this.platform}/block`, {
        //   method: 'POST',
        //   data: {
        //     _id: prefix + _id + suffix,
        //     group: prefix,
        //     ...data
        //   }
        // })
        mockData.push({ _id: prefix + _id + suffix, group: prefix, ...data })
      }

      // 请求成功
      if (true) {
        this.$message.success('发布成功！')
        this.showModal = false
        this.showConfirm = false
        this.editing = false
        this.getData(this.blockParams)
      }
      this.publishing = false
    },
    postOnlineStatus(item) {
      const { _id, isOnline } = item
      const txt = isOnline ? '下线' : '上线'
      this.$confirm({
        content: `是否确认进行${txt}操作`,
        onOk: async () => {
          // MOCK注释
          // let data = await http(`//${domain}/${this.platform}/block/${_id}`, {
          //   method: 'POST',
          //   data: { isOnline: !isOnline }
          // })
          mockData[0].isOnline = !isOnline

          // 请求成功
          if (true) {
            this.$message.success(txt + '成功')
            this.getData(this.blockParams)
          }
        }
      })
    },
    tableChange(pagination) {
      const { current: page, pageSize: size } = pagination
      this.blockParams = { ...this.blockParams, page, size }
      this.getData(this.blockParams)
    },
    handleTableData(list) {
      list.map(item => {
        item.grayType = item.gray.type
        item.status = item.isOnline ? '已上线' : '未上线'
        item.cache = item.cache || cacheBlank
        item.cache_time = item.cache.time || 0
        item.update_time = new Date(item.update_time).toLocaleString()
      })
    },
    async toggleHistory(item, index) {
      // 清空数据
      this.history = []
      // 展示/隐藏历史列表
      if (!item || this.showHistory === index + 1) {
        this.showHistory = 0
      } else {
        this.showHistory = index + 1
        this.loadingHistory = true

        // MOCK注释
        // this.history = await http(`//${domain}/${this.platform}/exblock/${item._id}`, {
        //   defaultData: []
        // })
        this.history = mockData;

        this.handleTableData(this.history)
        this.loadingHistory = false
      }
    },
    async getData(params = {}) {
      this.showHistory = 0
      this.loading = true

      // MOCK注释
      // this.total = await http(`//${domain}/${this.platform}/block/count`, {
      //   defaultData: 0,
      //   params
      // })
      // this.list = Object.values(await http(`//${domain}/${this.platform}/block`, {
      //   defaultData: [],
      //   params
      // }))
      this.total = mockData.length
      this.list = mockData

      this.handleTableData(this.list)
      this.blockParams = params
      this.loading = false
    }
  }
}
</script>
<style scoped>
.confirm-bottom-btn {
  margin: 0 24px;
}
</style>
