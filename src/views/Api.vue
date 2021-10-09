<template>
  <a-row>
    <common-select-bar
      :select-options="selectOptions"
      :left-btn="{ text: '新增接口' }"
      @leftBtnClick="editApi()"
      @search="getData"
    />
    <common-history
      @close="toggleHistory()"
      @edit="editApi"
      :position-height="75"
      :visible-index="showHistory"
      :data="history"
      :loading="loadingHistory"
      :columns="[
        {
          title: '接口名称',
          dataIndex: 'name',
          width: 180,
          align: 'center'
        },
        {
          title: '接口地址',
          dataIndex: 'url',
          width: 360,
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
      :scroll="{ x: 1220 }"
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
          dataIndex: '_id',
          fixed: 'left',
          width: 180,
          align: 'center'
        },
        {
          title: '接口名称',
          dataIndex: 'name',
          width: 190,
          align: 'center'
        },
        {
          title: '接口地址',
          dataIndex: 'url',
          width: 360
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
          width: 80,
          align: 'center'
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'operate' },
          fixed: 'right',
          width: 80,
          align: 'center'
        }
      ]"
      @change="tableChange"
    >
      <span slot="history" slot-scope="text, record, index">
        <a @click="toggleHistory(record, index)">{{ (showHistory === index + 1) ? '已展开' : '展开' }}</a>
      </span>
      <span slot="operate" slot-scope="text, record">
        <a @click="editApi(record)">{{ readOnly ? '查看' : '编辑' }}</a>
      </span>
    </a-table>
    <form-drawer
      :visible="editing"
      :form="form"
      :currentId="currentId"
      :show-history="showHistory"
      @postApi="postApi"
      @closeDrawer="editing = false"
    />
  </a-row>
</template>

<script>
import CommonSelectBar from '../components/common/selectBar'
import CommonChildTree from '../components/common/childTree'
import CommonHistory from '../components/common/history'
import FormDrawer from '../components/api/formDrawer'
import { http } from '../utils/http'
import { copyItem } from '../utils/tool'

const domain = 'localhost:3000/strategy';

const cacheBlank = {
  time: 0,
  key: []
}

const formBlank = {
  _id: '',
  name: '',
  url: '',
  timeout: 3000,
  method: 'GET',
  cache: cacheBlank,
  params: [],
  body: [],
  headers: [],
  multi: [],
  qipuIdKey: '',
  qipuDataKey: ''
}

export default {
  components: {
    CommonSelectBar,
    CommonChildTree,
    CommonHistory,
    FormDrawer
  },
  data() {
    const validateParams = (rule, params, callback) => {
      if (params.some(item => !item.type || !item._id)) {
        callback(new Error('请正确填写接口参数'))
      } else {
        callback()
      }
    }
    return {
      // 筛选项数据
      selectOptions: [
        {
          key: '_id',
          title: 'ID'
        },
        {
          key: 'name',
          title: '接口名称'
        },
        {
          key: 'url',
          title: '接口地址'
        },
        {
          key: 'editor',
          title: '更新者'
        }
      ],
      // 数据源历史数据
      loadingHistory: false,
      showHistory: 0,
      history: [],
      // 数据源数据
      loading: false,
      total: 0,
      list: [],
      apiParams: {},
      // 表单数据
      editing: false,
      form: formBlank,
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
    },
    readOnly() {
      const role = (this.$store.state.user.role || '').split(',')
      const curPt = role.find(item => item.replace(/_READONLY$/, '') === (this.platform || '').toUpperCase())
      return /_READONLY$/.test(curPt || '')
    }
  },
  methods: {
    // 表单初始处理
    initMultiHandler(multi = []) {
      multi.map(item => {
        const { children = [] } = item
        if (children.length) {
          item.type = 'Parent-A'
          this.initMultiHandler(children)
        } else {
          item.type = 'Array'
        }
      })
    },
    editApi(item, showHistory) {
      if (item) {
        this.initMultiHandler(item.multi)
        this.currentId = showHistory ? this.list[showHistory - 1]._id : item._id
      } else {
        this.currentId = ''
      }
      this.form = copyItem({ ...formBlank, ...item })
      this.editing = true
    },
    // 表单提交处理
    handlePostMulti(multi) {
      return multi.map(item => {
        const { type, _id, mapping, children = [] } = item
        return {
          _id,
          mapping,
          children: ['Parent-A'].includes(type) ? this.handlePostMulti(children) : []
        }
      })
    },
    async postApi(opt = {}) {
      const { _id, name, url, url_encode, content_type, timeout, method, cache, headers, params, body, multi, qipuIdKey, qipuDataKey } = copyItem(this.form)
      const data = {
        name,
        url,
        url_encode,
        content_type: method === 'POST' ? (content_type || 'FORM') : '',
        timeout,
        method,
        cache,
        qipuIdKey,
        qipuDataKey,
        headers,
        params,
        body,
        multi: this.handlePostMulti(multi),
        editor: this.username
      }
      let response = {}
      // let domain = opt.isTest ? '10.13.44.194' : 'domain'
      if (opt.isTest) {
        let testData = {}
        if (this.currentId) {
          testData = await http(`//${domain}/${this.platform}/interface?_id=${this.currentId}`)
        }
        if (testData[0]) {
          response = await http(`//${domain}/${this.platform}/interface/${this.currentId}`, {
            method: 'POST',
            data
          })
        } else {
          response = await http(`//${domain}/${this.platform}/interface`, {
            method: 'POST',
            data: { _id, ...data }
          })
        }
      } else if (this.currentId) {
        response = await http(`//${domain}/${this.platform}/interface/${_id}`, {
          method: 'POST',
          data
        })
      } else {
        response = await http(`//${domain}/${this.platform}/interface`, {
          method: 'POST',
          data: { _id, ...data }
        })
      }
      if (Object.keys(response).length) {
        this.$message.success('发布成功！')
        this.editing = false
        this.getData(this.apiParams)
      }
    },
    // 筛选项改变
    tableChange(pagination) {
      const { current: page, pageSize: size } = pagination
      this.apiParams = { ...this.apiParams, page, size }
      this.getData(this.apiParams)
    },
    // 数据源列表处理
    handleTableData(list) {
      list.map(item => {
        item.update_time = new Date(item.update_time).toLocaleString()
      })
    },
    // 获取数据源列表
    async getData(params = {}) {
      this.loading = true
      this.total = await http(`//${domain}/${this.platform}/interface/count`, {
        defaultData: 0,
        params
      })
      this.list = await http(`//${domain}/${this.platform}/interface`, {
        defaultData: [],
        params
      })
      this.handleTableData(this.list)
      this.apiParams = params
      this.loading = false
    },
    // 获取数据源历史数据
    async toggleHistory(item, index) {
      // 清空数据
      this.history = []
      // 展示/隐藏历史列表
      if (!item || this.showHistory === index + 1) {
        this.showHistory = 0
      } else {
        this.showHistory = index + 1
        this.loadingHistory = true
        this.history = await http(`//${domain}/${this.platform}/exInterface/${item._id}`, {
          defaultData: []
        })
        this.handleTableData(this.history)
        this.loadingHistory = false
      }
    }
  }
}
</script>
