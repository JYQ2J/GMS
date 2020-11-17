<template>
  <a-drawer
    title="模块编辑"
    width="calc(100% - 200px)"
    :zIndex="20"
    :visible="visible"
    :body-style="{ paddingBottom: '80px', scrollX: 'auto' }"
    @close="$emit('closeDrawer')"
  >
    <div v-if="showHistory" class="mask" />
    <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
      :colon="false"
      :wrapperCol="{ span: 19, offset: 1 }"
      :labelCol="{ span: 3 }"
    >
      <a-form-model-item required label="模块ID" prop="_id">
        <a-input
          v-if="currentId"
          v-model="currentId"
          :disabled="!!currentId"
          placeholder="请输入标识模块的唯一ID，不能与已有的模块ID重复"
        />
        <a-input-group v-else compact>
          <a-select
            show-search
            v-model="form.prefix"
            :options="prefix"
            placeholder="请选择模块频道"
            style="width: 30%; text-align: right;"
          />
          <a-input
            v-model="form._id"
            placeholder="请输入模块ID自定义部分"
            style="width: 40%;"
          />
          <a-select
            v-model="form.suffix"
            :options="suffix"
            placeholder="请选择模块类型"
            style="width: 30%;"
          />
        </a-input-group>
      </a-form-model-item>
      <a-form-model-item required label="模块名称" prop="name">
        <a-input v-model="form.name" placeholder="请简述模块应用场景" />
      </a-form-model-item>
      <a-form-model-item
        v-if="form.suffix !== 'Data' && !currentId.endsWith('Data')"
        label="灰度类型"
        prop="gray"
        required
      >
        <a-input-group compact>
          <a-select
            v-model="form.gray.type"
            :options="[
              {
                key: 'NONE',
                title: '全量'
              },
              {
                key: 'INPUT',
                title: '输入参数'
              },
              {
                key: 'ABTEST',
                title: '天秤平台'
              },
              {
                key: 'COOKIE',
                title: 'COOKIE'
              }
            ]"
            :style="`width: ${form.gray.type !== 'NONE' ? '130px' : '100%'};`"
          />
          <a-input
            v-if="form.gray.type !== 'NONE'"
            v-model="form.gray._id"
            placeholder="请输入灰度参数字段"
            style="width: calc(100% - 130px);"
          />
        </a-input-group>
      </a-form-model-item>
      <a-form-model-item label="缓存策略" prop="cache" required>
        <a-input-group compact style="width: 35%;">
          <a-tag class="tag-text">缓存时间</a-tag>
          <a-input-number style="width: calc(100% - 100px);" :min="0" v-model="form.cache.time" />
        </a-input-group>
        <a-input-group compact style="width: 65%;">
          <a-tag class="tag-text">缓存参数</a-tag>
          <a-select
            v-model="form.cache.key"
            :options="cacheKeyOptions"
            mode="multiple"
            placeholder="请输入接口缓存关联的键值"
            style="width: calc(100% - 80px);"
          />
        </a-input-group>
      </a-form-model-item>
      <a-form-model-item v-if="form.suffix !== 'Data' && !currentId.endsWith('Data')" label="数据展示策略">
        <a-button
          type="dashed"
          icon="plus-circle"
          style="width: 133px;"
          @click="addItem(form.chunk, { key: '', value: 0 }, true)"
        >添加分组</a-button>
        <common-tip style="margin: 0 16px;" placement="right" title="前端控制展示策略的分组（示例场景：大图2个，小图8个）" />
        <a-input-group v-for="(item, index) in (form.chunk || [])" :key="index" style="width: auto;" compact>
          <a-input style="width: 80px;" placeholder="分组名称" v-model="item.key" />
          <a-input-number style="width: 55px;" :min="1" v-model="item.value" />
          <a-icon
            type="delete"
            theme="twoTone"
            style="width: 20px; margin: 0 16px; line-height: 32px; font-size: 18px;"
            @click="deleteItem(form.chunk, index)"
          />
        </a-input-group>
      </a-form-model-item>
      <a-form-model-item required label="数据列表" prop="list">
        <a-collapse default-active-key="0">
          <a-collapse-panel
            v-for="(item, index) in form.list"
            :key="index"
            :header="`Block ID：${item._id || '暂无'}， 灰度值：${grayTxt(form.gray.type, item.gray)}`"
          >
            <a-row :gutter="[50, 20]">
              <a-col :span="12">
                <a-input addon-before="Block ID" v-model="item._id" size="small" class="tip-item" />
                <common-tip class="ml-16" title="用于投递统计的区块ID" />
              </a-col>
              <a-col :span="12">
                <a-input v-if="form.gray.type !== 'NONE'" addon-before="灰度值" v-model="item.gray" size="small" />
              </a-col>
            </a-row>
            <!-- API列表 -->
            <a-row
              v-for="(apiItem, apiIndex) in item.api"
              :key="`${apiItem._id}-${apiIndex}`"
            >
              <a-divider orientation="left">
                {{ `数据源 - ${apiItem.name || (apiItem.base || {}).name || '请选择'}` }}
              </a-divider>
              <!-- API选择框 -->
              <a-row :gutter="[5, 10]" align="middle">
                <a-col :span="4">
                  <a-tag class="center-100 height-24"><b>数据源</b></a-tag>
                </a-col>
                <a-col :span="18">
                  <a-select
                    show-search
                    size="small"
                    :default-value="apiSelectDefault(apiItem, index, apiIndex)"
                    @change="apiChange"
                    @focus="apiFocus(apiItem)"
                  >
                    <a-select-option
                      v-for="(a, i) in getListApiOption(index, apiIndex)"
                      :key="i"
                      :value="`${index}-${apiIndex}_${a._id}${a.base ? '_default' : ''}`"
                    >{{ apiTitle(a) }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="2" class="right">
                  <a-icon
                    v-if="apiIndex"
                    type="minus-circle"
                    style="font-size: 18px;"
                    @click="deleteItem(item.api, apiIndex)"
                  />
                  <common-tip v-else title="数据来源接口，所有数据源均需要在数据源管理中进行注册" />
                </a-col>
              </a-row>
              <!-- API配置 -->
              <a-row v-if="apiItem._id" :gutter="[5, 10]">
                <!-- 请求条件 -->
                <a-col :span="4">
                  <a-tag class="center-100 height-24"><b>请求条件</b></a-tag>
                </a-col>
                <a-col :span="18">
                  <required type="api" :required="apiItem.required" />
                </a-col>
                <a-col :span="2" class="right">
                  <common-tip title="如果仅在某些条件下获取此数据源，则在此添加限制条件" />
                </a-col>
                <!-- 阻塞级别 -->
                <a-col :span="4">
                  <a-tag class="center-100 height-24"><b>阻塞级别</b></a-tag>
                </a-col>
                <a-col :span="18">
                  <a-select
                    v-model="apiItem.level"
                    :options="[
                      { key: 'error', title: '报错情况下，阻塞请求链路' },
                      { key: 'warn', title: '非阻塞请求' }
                    ]"
                    placeholder="请输入接口阻塞级别"
                    size="small"
                  />
                </a-col>
                <a-col :span="2" class="right">
                  <common-tip title="数据源接口报错时，整个模块的数据链路是否阻塞/报错" />
                </a-col>
                <!-- Headers -->
                <!-- <a-col :span="4">
                  <a-tag class="center-100 height-24"><b>Headers</b></a-tag>
                </a-col>
                <a-col :span="18">
                  <common-form-item-params
                    :list="apiItem.headers"
                    :api-item="apiItem"
                    @addItem="addItem"
                    @deleteItem="deleteItem"
                  />
                </a-col>
                <a-col :span="2" class="right">
                  <common-tip title="接口请求中的请求头数据" />
                </a-col> -->
                <!-- 参数列表 -->
                <a-col :span="4">
                  <a-tag class="center-100 height-24"><b>URL参数</b></a-tag>
                </a-col>
                <a-col :span="18">
                  <common-form-item-params
                    :list="apiItem.params"
                    :api-item="apiItem"
                    :api="item.api"
                    @addItem="addItem"
                    @deleteItem="deleteItem"
                  />
                </a-col>
                <a-col :span="2" class="right">
                  <common-tip title="GET/POST请求中的URL参数" />
                </a-col>
                <!-- Post Body -->
                <a-col :span="4" v-if="(apiItem.base || {}).method === 'POST'">
                  <a-tag class="center-100 height-24"><b>Post Body</b></a-tag>
                </a-col>
                <a-col :span="18" v-if="(apiItem.base || {}).method === 'POST'">
                  <common-form-item-params
                    :list="apiItem.body"
                    :api-item="apiItem"
                    :api="item.api"
                    @addItem="addItem"
                    @deleteItem="deleteItem"
                  />
                </a-col>
                <a-col :span="2" class="right" v-if="(apiItem.base || {}).method === 'POST'">
                  <common-tip title="POST请求中的请求Body数据" />
                </a-col>
                <!-- 基础数据key配置 -->
                <a-col :span="4" class="mt-20">
                  <a-tag class="center-100 height-24"><b>基础数据</b></a-tag>
                </a-col>
                <a-col :span="18" class="mt-20">
                  <a-switch
                    checked-children="需要"
                    un-checked-children="不需要"
                    v-model="apiItem.hasQipu"
                  />
                </a-col>
                <a-col :span="13" v-if="apiItem.hasQipu">
                  <a-input addon-before="实体ID-输入节点" v-model="apiItem.qipuIdKey" size="small" />
                </a-col>
                <a-col :span="9" v-if="apiItem.hasQipu">
                  <a-input addon-before="实体数据-输出字段" v-model="apiItem.qipuDataKey" size="small" />
                </a-col>
                <a-col :span="2" v-if="apiItem.hasQipu" class="right">
                  <common-tip title="实体ID-输入节点 -> 获取实体信息，实体数据-输出字段 -> 映射阶段的基础数据结构字段名" />
                </a-col>
                <!-- Formater -->
                <a-col :span="22" class="mt-20">
                  <common-child-tree
                    v-for="(f, fIndex) in apiItem.formater"
                    v-slot="childProps"
                    :key="fIndex"
                    :data="f"
                    :data-index="fIndex"
                    :parent-array="apiItem.formater"
                    :add-function="addItem"
                    :add-blank="{
                      type: 'String',
                      mapping: [{ type: 'KEY', required: [], kv2v: {} }],
                      sort: {},
                      a2o: {},
                      children: []
                    }"
                    row-style="margin-bottom: 10px;"
                  >
                    <!-- 映射 - 输出 -->
                    <a-card-meta style="padding: 12px; height: auto;">
                      <!-- 映射 - 输出 - 基本配置 -->
                      <a-row slot="title">
                        <a-col :span="4">
                          <a-tag class="width-90 center"><b>输出字段</b></a-tag>
                        </a-col>
                        <a-col :span="19">
                          <a-input-group compact size="small">
                            <a-select
                              v-model="childProps.data.type"
                              :options="[
                                { key: 'String', title: '字符串' },
                                { key: 'Number', title: '数字' },
                                { key: 'Boolean', title: '布尔值' },
                                { key: 'Object', title: '对象' },
                                { key: 'Array', title: '数组' },
                                { key: 'A2O', title: '数组->对象' },
                                { key: 'Parent-O', title: '父级对象' },
                                { key: 'Parent-A', title: '父级数组' },
                                { key: 'Parent-A2O', title: '父级数组->对象' }
                              ]"
                              placeholder="String"
                              default-value="asc"
                              size="small"
                              style="width: 210px;"
                            />
                            <a-input
                              v-model="childProps.data.key"
                              size="small"
                              style="text-align: right; width: calc(100% - 210px);"
                            />
                          </a-input-group>
                        </a-col>
                        <a-col :span="1" class="right">
                          <a-icon
                            type="delete"
                            theme="twoTone"
                            style="font-size: 18px;"
                            @click="deleteItem(childProps.parentArray, childProps.index)"
                          />
                        </a-col>
                      </a-row>
                      <!-- 映射 - 输出 - 数组转对象数据配置 -->
                      <a-row slot="description" v-if="childProps.data.type.includes('A2O')">
                        <a-col :span="7" :offset="4">
                          <a-input
                            v-model="childProps.data.a2o.key"
                            addon-before="Key"
                            size="small"
                            style="text-align: right; width: 210px;"
                          />
                        </a-col>
                        <a-col :span="12">
                          <a-input
                            v-model="childProps.data.a2o.value"
                            addon-before="Value"
                            size="small"
                            style="text-align: right;"
                          />
                        </a-col>
                      </a-row>
                      <!-- 映射 - 输出 - 数组数据配置 -->
                      <a-row slot="description" v-if="['Array', 'Parent-A'].includes(childProps.data.type)">
                        <a-col :span="19" :offset="4">
                          <a-input-group compact size="small" style="width: 210px;">
                            <a-select
                              v-model="childProps.data.sort.order"
                              :options="[
                                { key: 'asc', title: '升序' },
                                { key: 'desc', title: '降序' }
                              ]"
                              placeholder="类型"
                              default-value="asc"
                              size="small"
                              style="width: 35%;"
                            />
                            <a-input
                              v-model="childProps.data.sort.key"
                              placeholder="排序字段"
                              style="width: 65%; text-align: right;"
                            />
                          </a-input-group>
                          <a-input-group style="width: calc(100% - 210px); text-align: right;">
                            <a-input-number
                              style="width: 30%;"
                              size="small"
                              :formatter="val => `起始位置:  ${val || 0}`"
                              :min="0"
                              v-model="childProps.data.startIndex"
                            />
                            <a-input-number
                              style="margin-left: 2px; width: 30%;"
                              size="small"
                              :formatter="val => `尺寸:  ${val || 0}`"
                              :min="0"
                              v-model="childProps.data.size"
                            />
                            <a-input-number
                              style="margin-left: calc(5% - 1px); width: 30%;"
                              size="small"
                              :formatter="val => `序号:  ${val || 0}`"
                              :min="0"
                              v-model="childProps.data.order"
                            />
                          </a-input-group>
                        </a-col>
                        <a-col :span="1" class="right height-24">
                          <common-tip title="当输出节点由多个数据源数据字段组成，该序号用于排序不同的数据源" />
                        </a-col>
                      </a-row>
                    </a-card-meta>
                    <!-- 映射 - 输入 -->
                    <a-card-grid
                      v-for="(mapItem, mapIndex) in childProps.data.mapping"
                      :key="mapIndex"
                      style="width: 100%; padding: 12px;"
                    >
                      <a-col :span="4">
                        <a-tag class="width-90 center"><b>输入 - {{ mapIndex + 1 }}</b></a-tag>
                      </a-col>
                      <a-col :span="19">
                        <a-input-group compact size="small">
                          <a-select
                            v-model="mapItem.type"
                            default-value="KEY"
                            :options="[
                              { key: 'KEY', title: '输入节点' },
                              { key: 'VALUE', title: '输入常量' },
                              { key: 'KV2V', title: '输入KV节点' },
                              { key: 'RULE', title: '输入规则' },
                            ]"
                            :style="`width: ${mapIndex ? 140 : 210}px;`"
                            placeholder="输入节点"
                            size="small"
                          />
                          <a-select
                            v-if="mapIndex"
                            v-model="mapItem.operation"
                            :options="[
                              { key: '', title: '或' },
                              { key: '+', title: '加' },
                              { key: '-', title: '减' },
                              { key: '*', title: '乘' },
                              { key: '/', title: '除' },
                            ]"
                            placeholder="或"
                            size="small"
                            style="width: 70px;"
                          />
                          <a-input
                            v-model="mapItem.value"
                            style="width: calc(100% - 210px); text-align: right;"
                          />
                        </a-input-group>
                      </a-col>
                      <a-col :span="1" class="right">
                        <a-icon
                          v-if="mapIndex"
                          type="minus-circle"
                          theme="twoTone"
                          style="font-size: 18px;"
                          @click="deleteItem(childProps.data.mapping, mapIndex)"
                        />
                        <a-icon
                          v-else
                          type="plus-circle"
                          theme="twoTone"
                          style="font-size: 18px;"
                          @click="addItem(childProps.data.mapping, { type: 'KEY', required: [], kv2v: {} }, true)"
                        />
                      </a-col>
                      <a-col v-if="mapItem.type === 'KV2V'" :span="19" :offset="4" class="mt-10">
                        <a-input
                          v-model="mapItem.kv2v.key"
                          addon-before="Key"
                          size="small"
                          style="text-align: right; width: 20%; margin-right: 5%;"
                        />
                        <a-input
                          v-model="mapItem.kv2v.keyName"
                          addon-before="Key-Name"
                          size="small"
                          style="text-align: right; width: 50%; margin-right: 5%;"
                        />
                        <a-input
                          v-model="mapItem.kv2v.value"
                          addon-before="Value"
                          size="small"
                          style="text-align: right; width: 20%;"
                        />
                      </a-col>
                      <a-col v-else :span="19" :offset="4" class="mt-10">
                        <required title="约束条件" :required="mapItem.required" />
                      </a-col>
                      <a-col v-if="mapItem.type === 'KV2V'" :span="1" class="mt-10 right">
                        <common-tip title="将KV数组中的某个Value属性直接输出，如：[{ name: 'a', value: '1', name: 'b', value: '2' }] 输出 name等于b的value（2）" />
                      </a-col>
                      <a-col v-else :span="1" class="mt-20 right">
                        <common-tip title="约束条件用于控制是否使用该输入逻辑，若不满足下述条件，则进入下一个输入映射逻辑" />
                      </a-col>
                    </a-card-grid>
                  </common-child-tree>
                  <a-button
                    @click="addItem(apiItem.formater, {
                      type: 'String',
                      mapping: [{ type: 'KEY', required: [], kv2v: {} }],
                      sort: {},
                      a2o: {},
                      children: []
                    }, true)"
                    type="dashed"
                    icon="plus"
                    size="small"
                    block
                  >添加映射节点</a-button>
                </a-col>
                <a-col :span="2" class="mt-20 right">
                  <common-tip title="模块输出数据的字段映射规则" />
                </a-col>
              </a-row>
              <a-divider orientation="right"><a-icon type="caret-up" /></a-divider>
            </a-row>
            <a-button
              type="dashed"
              icon="plus"
              size="small"
              block
              @click="addItem(item.api, { _id: '', required: [], level: 'error', formater: [] })"
            >添加数据源</a-button>
            <a-icon v-if="index" slot="extra" type="delete" @click="deleteItem(form.list, index)" />
          </a-collapse-panel>
        </a-collapse>
        <a-button
          v-if="form.gray.type !== 'NONE'"
          type="dashed"
          icon="plus"
          block
          @click="addItem(form.list, { _id: '', gray: '', api: [{ level: 'error', formater: [] }] })"
        >添加数据域</a-button>
      </a-form-model-item>
    </a-form-model>
    <a-row
      type="flex"
      align="middle"
      justify="center"
      class="drawer-bottom"
    >
      <a-button class="drawer-bottom-btn" @click="$emit('closeDrawer')">取消</a-button>
      <preview
        :id="form._id"
        :env="showHistory ? 'ex' : 'preview'"
        :gray="form.gray.type"
        :list="form.list"
        @preview="(id, env, gray) => $emit('preview', id, env, gray)"
      />
      <a-button
        class="drawer-bottom-btn"
        type="primary"
        @click="validate"
        :loading="publishing"
      >{{ showHistory ? '回滚' : '提交' }}</a-button>
    </a-row>
  </a-drawer>
</template>

<script>
import CommonTip from '../common/tip'
import CommonChildTree from '../common/childTree'
import CommonFormItemParams from '../common/formItemParams'
import Preview from '../block/preview'
import Required from '../block/required'
import { http } from '../../utils/http'
import { prefix, suffix } from '../../utils/block'

let mockData = [{
  "_id":"testApi",
  "name":"测试数据",
  "url":"http://xxx.xxx.xxx",
  "qipuIdKey":"data.items.id",
  "qipuDataKey":"QIPU",
  "editor":"jiayanqi",
  "update_time":new Date(),
  "create_time":new Date(),
  "body":[],
  "params":[{
    "_id":"size",
    "default":"50",
    "type":"KV"
  }],
  "headers":[],
  "cache":{
    "time":0,
    "key":[]
  },
  "method":"GET",
  "timeout":3000
}]
const domain = 'xxx'

export default {
  name: 'formDrawer',
  components: {
    Required,
    Preview,
    CommonTip,
    CommonChildTree,
    CommonFormItemParams
  },
  props: ['visible', 'block', 'form', 'currentId', 'showHistory', 'publishing'],
  data() {
    const validateId = (rule, id, callback) => {
      const { currentId, form } = this;
      const { prefix, suffix } = form;
      if (currentId) {
        if (/^[A-Za-z0-9]+$/.test(currentId)) {
          callback()
        } else if (currentId) {
          callback(new Error('模块ID仅允许输入26个大小写英文字母和数字，请检查并修改'))
        } else {
          callback(new Error('请填写模块ID'))
        }
      } else {
        if (!prefix) {
          callback(new Error('请选择模块频道'))
        } else if (!suffix) {
          callback(new Error('请选择模块类型'))
        } else if (!id) {
          callback(new Error('请填写模块ID'))
        } else if (!/^[A-Z0-9]([A-Za-z0-9]*)$/.test(id)) {
          callback(new Error('模块ID需以大驼峰命名（大写字母或数字开头），允许输入26个大小写英文字母和数字，请检查并修改'))
        } else {
          callback()
        }
      }
      
    }
    const validateList = (rule, list, callback) => {
      if (list.some(item => !item._id)) {
        callback(new Error('请填写Block ID'))
      } else if (list.some(item => item.api.some(api => !api.base && !api._id))) {
        callback(new Error('请正确选择API'))
      } else if (list.some(item => item.api.some(api => api.formater.some(f => !f.key)))) {
        callback(new Error('请正确填写映射节点'))
      } else if (list.some(item => item.api.some(api => !api.level))) {
        callback(new Error('请正确填写数据源阻塞级别'))
      } else {
        callback()
      }
    }
    return {
      prefix,
      suffix,
      api: [],
      apiObj: {},
      rules: {
        _id: [{ validator: validateId, trigger: ['change', 'blur'] }],
        name: [{ required: true, message: '请填写模块名称', trigger: ['change', 'blur'] }],
        gray: [{ required: true, message: '请填写灰度规则', trigger: ['change', 'blur'] }],
        list: [{ validator: validateList, trigger: ['change', 'blur'] }]
      }
    }
  },
  mounted() {
    this.getApi()
  },
  watch: {
    $route(to) {
      this.getApi()
    }
  },
  computed: {
    platform() {
      return this.$route.params.platform
    },
    cacheKeyOptions() {
      let result = [];
      this.form.list.map(item => item.api.map(api => (api.params || []).map(param => {
        if (param.type === 'INPUT' && param._id && !result.includes(param._id)) {
          result.push(param._id)
        }
      })))
      return result.map(v => ({ key: v, title: v }));
    }
  },
  methods: {
    async getApi() {
      // MOCK注释
      // this.api = (await http(`//${domain}/${this.platform}/interface`, {
      //   defaultData: []
      // })).map(item => {
      //   this.apiObj[item._id] = item
      //   item.hasQipu = !!item.qipuIdKey
      //   return item
      // })
      this.api = mockData.map(item => {
        this.apiObj[item._id] = item
        item.hasQipu = !!item.qipuIdKey
        return item
      })
    },
    addItem(arr, initItem = {}, noLimit = false) {
      if (noLimit || arr.length === 0 || arr[arr.length - 1]._id) {
        arr.push(initItem)
      } else {
        this.$message.warning('请完成前述空项的填写！')
      }
    },
    deleteItem(arr, index) {
      arr.splice(index, 1)
    },
    validate() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.form.isOnline) {
            this.$emit('showConfirm')
          } else {
            this.$emit('postBlock')
          }
        }
      })
    },
    apiFocus(item) {
      if (item._id && !this.apiObj[item._id]) {
        this.apiObj[item._id] = item
      }
    },
    apiChange(val) {
      const [index, id] = val.split('_')
      const [listIndex, apiIndex] = index.split('-')
      const curItem = {
        formater: [],
        required: [],
        ...this.apiObj[id.replace(/_default$/, '')]
      }
      curItem.params.concat(curItem.body, curItem.headers).map(param => {
        !param.value && (param.value = param.default)
      })
      // 直接操作数组，触发渲染
      this.form.list[listIndex].api.splice(apiIndex, 1, curItem)
    },
    apiSelectDefault(item, listIndex, apiIndex) {
      if (item._id) {
        const id = item._id + (item.base ? '_default' : '')
        return `${listIndex}-${apiIndex}_${id}`
      }
    },
    apiTitle(item) {
      if (item.base) {
        return `当前：${item.base._id} - ${item.base.name}`
      } else {
        return `${item._id} - ${item.name}`
      }
    },
    grayTxt(type, val) {
      return type === 'NONE' ? '全量' : (val ? val : '暂无')
    },
    // 获取全部数据源选择列表
    getListApiOption(listIndex, apiIndex) {
      const currentApi = this.block._id ? ((this.block.list[listIndex] || {}).api || {})[apiIndex] : null
      return (currentApi ? [currentApi] : []).concat(this.api)
    }
  }
}
</script>
<style scoped>
.drawer-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  background-color: #fff;
  z-index: 999;
}
.drawer-bottom-btn {
  margin: 16px 35px;
}
.tag-text {
  width: 80px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
}
</style>
