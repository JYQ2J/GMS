<template>
  <a-drawer
    title="模块编辑"
    width="calc(100% - 200px)"
    :zIndex="20"
    :visible="visible"
    :body-style="{ paddingBottom: '80px', scrollX: 'auto' }"
    @close="close"
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
            @blur="() => form._id = (form._id || '').trim()"
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
            @blur="() => form.gray._id = (form.gray._id || '').trim()"
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
                <a-input
                  addon-before="Block ID"
                  v-model="item._id"
                  @blur="() => item._id = (item._id || '').trim()"
                  size="small"
                  class="tip-item"
                />
                <common-tip class="ml-16" title="用于投递统计的区块ID" />
              </a-col>
              <a-col :span="12">
                <a-input
                  v-if="form.gray.type !== 'NONE'"
                  addon-before="灰度值"
                  v-model="item.gray"
                  @blur="() => item.gray = (item.gray || '').trim()"
                  size="small"
                />
              </a-col>
            </a-row>
            <!-- API列表 -->
            <a-row
              v-for="(apiItem, apiIndex) in item.api"
              :key="`${apiItem._id}-${apiIndex}`"
            >
              <a-divider orientation="left">
                <a-icon
                  style="margin-right: 10px;"
                  :type="apiHide[`${apiItem._id}-${apiIndex}`] ? 'caret-right' : 'caret-down'"
                  @click="toggle(`${apiItem._id}-${apiIndex}`)"
                />
                <span
                  @click="toggle(`${apiItem._id}-${apiIndex}`)"
                  style="cursor: pointer;"
                >{{ `数据源 - ${apiItem.name || (apiItem.base || {}).name || '请选择'}` }}</span>
              </a-divider>
              <!-- API选择框 -->
              <a-row :gutter="[5, 10]" align="middle" v-show="!apiHide[`${apiItem._id}-${apiIndex}`]">
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
                      v-for="(a, i) in getListApiOption(item.api, apiIndex, index)"
                      :key="i"
                      :value="`${index}-${apiIndex}_${a._id}${a.base ? '_default' : ''}`"
                    >{{ apiTitle(a) }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="2" class="right">
                  <a-icon
                    v-if="item.api.length > 1"
                    type="minus-circle"
                    style="font-size: 18px;"
                    @click="deleteItem(item.api, apiIndex)"
                  />
                  <common-tip v-else title="数据来源接口，所有数据源均需要在数据源管理中进行注册" />
                </a-col>
              </a-row>
              <!-- API配置 -->
              <a-row v-if="apiItem._id" :gutter="[5, 10]" v-show="!apiHide[`${apiItem._id}-${apiIndex}`]">
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
                <common-form-item-params
                  label="Headers"
                  tip="接口请求中的请求头数据"
                  :required="true"
                  :span="18"
                  :list="apiItem.headers"
                  :api-item="apiItem"
                  :api="item.api"
                  @addItem="addItem"
                  @deleteItem="deleteItem"
                />
                <!-- 参数列表 -->
                <common-form-item-params
                  label="URL参数"
                  tip="GET/POST请求中的URL参数"
                  :required="true"
                  :span="18"
                  :list="apiItem.params"
                  :api-item="apiItem"
                  :api="item.api"
                  @addItem="addItem"
                  @deleteItem="deleteItem"
                />
                <!-- Post Body -->
                <common-form-item-params
                  v-if="(apiItem.base || apiItem).method === 'POST'"
                  label="Post Body"
                  tip="POST请求中的请求Body数据"
                  :required="true"
                  :span="18"
                  :list="apiItem.body"
                  :api-item="apiItem"
                  :api="item.api"
                  @addItem="addItem"
                  @deleteItem="deleteItem"
                />
                <!-- 奇谱key配置 -->
                <a-col :span="4" class="mt-20">
                  <a-tag class="center-100 height-24"><b>奇谱数据</b></a-tag>
                </a-col>
                <a-col :span="18" class="mt-20 right">
                  <a-switch
                    checked-children="需要"
                    un-checked-children="不需要"
                    v-model="apiItem.hasQipu"
                  />
                </a-col>
                <a-col :span="2" class="right" style="margin-top: 23px;">
                  <common-tip title="数据源数据中是否包含奇谱ID，以及是否获取对应的奇谱实体数据" />
                </a-col>
                <a-col :span="4" v-show="apiItem.hasQipu">
                  <a-tag v-if="apiItem.qipuIdConst" class="center-100 height-24"><big>奇谱ID</big></a-tag>
                  <query-popover
                    v-else
                    name="奇谱ID - 输入节点"
                    map-key="qipuIdKey"
                    :map-data="[apiItem]"
                    :index="0"
                    :api-data="apiItem"
                    :sm="true"
                  />
                </a-col>
                <a-col :span="13" style="height: 34px;" v-show="apiItem.hasQipu">
                  <a-input
                    v-model="apiItem.qipuIdKey"
                    @blur="() => apiItem.qipuIdKey = (apiItem.qipuIdKey || '').trim()"
                    size="small"
                  />
                </a-col>
                <a-col :span="5" class="right" v-show="apiItem.hasQipu">
                  <a-switch
                    checked-children="自定义奇谱ID值"
                    un-checked-children="奇谱ID数据节点"
                    v-model="apiItem.qipuIdConst"
                    @change="qipuIdConstChange(apiItem)"
                  />
                </a-col>
                <a-col :span="2" v-show="apiItem.hasQipu" class="right">
                  <common-tip title="奇谱ID-输入节点 -> 获取奇谱实体信息对应到数据源数据中奇谱ID的节点位置，支持可视化选取" />
                </a-col>
                <a-col :span="4" v-show="apiItem.hasQipu">
                  <a-tag class="center-100 height-24"><big>奇谱数据 - 输出字段</big></a-tag>
                </a-col>
                <a-col :span="13" v-show="apiItem.hasQipu">
                  <a-input
                    v-model="apiItem.qipuDataKey"
                    @blur="() => apiItem.qipuDataKey = (apiItem.qipuDataKey || '').trim()"
                    size="small"
                  />
                </a-col>
                <a-col :offset="1" :span="4" v-show="apiItem.hasQipu">
                  <a-input-group compact>
                    <a-tag class="group-tag">最大尺寸</a-tag>
                    <a-input-number
                      style="width: 50%;"
                      size="small"
                      :min="0"
                      :formatter="value => value || '全部'"
                      v-model="apiItem.qipuSize"
                    />
                  </a-input-group>
                </a-col>
                <a-col :span="2" v-show="apiItem.hasQipu" class="right">
                  <common-tip title="最大尺寸 -> 获取奇谱实体信息的最大个数，奇谱数据-输出字段 -> 映射阶段的奇谱结构别名" />
                </a-col>
                <!-- 输出映射配置 -->
                <a-col :span="4" class="mt-20">
                  <a-tag class="center-100 height-24"><b>输出映射</b></a-tag>
                </a-col>
                <a-col :span="18" class="mt-20 right">
                  <a-button
                    :disabled="!apiItem.formater || !apiItem.formater.length"
                    @click="$store.commit('updateNodeClip', apiItem.formater)"
                    size="small"
                    style="margin: 0 2.5px;"
                  >一键复制</a-button>
                  <a-button
                    :disabled="!$store.state.nodeClip"
                    @click="apiItem.formater = apiItem.formater.concat($store.state.nodeClip)"
                    size="small"
                    style="margin: 0 2.5px;"
                  >一键粘贴</a-button>
                  <!-- <a-switch checked-children="折叠" un-checked-children="平铺" v-model="formaterCollapse" /> -->
                </a-col>
                <a-col :span="2" class="right" style="margin-top: 23px;">
                  <common-tip title="输出映射是否折叠成树状结构" />
                </a-col>
                <!-- Formater -->
                <a-col :span="22" v-if="formaterCollapse" @click="popupReady.api = false">
                  <a-button
                    v-if="formaterCollapse && apiItem.formater.length === 0"
                    @click="addNode(false, false, apiItem)"
                    type="dashed"
                    icon="plus"
                    size="small"
                    block
                  >添加映射节点</a-button>
                  <a-dropdown :trigger="['contextmenu']" :visible="popupReady.api === apiIndex">
                    <a-tree
                      :default-expand-all="true"
                      :show-line="true"
                      :tree-data="apiItem.formater"
                      :replace-fields="{ key: 'id', title: 'key' }"
                      @select="(selected, v) => onSelect(selected, v, apiItem)"
                      @rightClick="(v) => onRightClick('api', v, apiItem, apiIndex)"
                    ></a-tree>
                    <a-menu slot="overlay" @click="popupReady.api = false">
                      <a-menu-item @click="isEdit = true">编辑</a-menu-item>
                      <a-menu-item @click="$store.commit('updateNodeClip', editNode.dataRef)">一键复制</a-menu-item>
                      <a-menu-item
                        v-if="$store.state.nodeClip"
                        @click="addNode($store.state.nodeClip)"
                      >一键粘贴</a-menu-item>
                      <a-menu-item
                        v-if="editNode.dataRef && editNode.dataRef.type.includes('Parent')"
                        @click="addNode(false, true)"
                      >添加子级节点</a-menu-item>
                      <a-menu-item @click="addNode()">添加节点</a-menu-item>
                      <a-menu-item @click="deleteNode()">删除节点</a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </a-col>
                <!-- <a-col :span="22" v-else>
                  <common-child-tree
                    v-for="(f, fIndex) in apiItem.formater"
                    v-slot="childProps"
                    :key="fIndex"
                    :data="f"
                    :data-index="fIndex"
                    :parent-array="apiItem.formater"
                    :add-function="addItem"
                    :add-blank="formatItemBlank"
                    row-style="margin-bottom: 10px;"
                  >
                    <mapping-out :editNode="childProps.data" />
                    <mapping-in
                      v-for="(mapItem, mapIndex) in (childProps.data.mapping || [])"
                      :key="mapIndex"
                      :index="mapIndex"
                      :map-data="childProps.data.mapping"
                      :map-type="childProps.data.type"
                      :api-data="apiItem"
                      :parent-input="editParentInput"
                    />
                  </common-child-tree>
                  <a-button
                    @click="addItem(apiItem.formater, {
                      type: 'String',
                      mapping: [{ type: 'KEY', required: [], kv2v: {}, link: {} }],
                      sort: {},
                      a2o: { required: [] },
                      children: []
                    }, true)"
                    type="dashed"
                    icon="plus"
                    size="small"
                    block
                  >添加映射节点</a-button>
                </a-col> -->
              </a-row>
              <a-divider orientation="right">
                <a-icon :type="apiHide[`${apiItem._id}-${apiIndex}`] ? 'caret-left' : 'caret-up'" />
              </a-divider>
            </a-row>
            <a-button
              type="dashed"
              icon="plus"
              size="small"
              block
              @click="addItem(item.api, { _id: '', required: [], level: 'error', formater: [] })"
            >添加数据源</a-button>
            <a-divider orientation="left">
              <a-icon
                style="margin-right: 10px;"
                :type="apiHide.formater ? 'caret-right' : 'caret-down'"
                @click="toggle('formater')"
              />
              <span @click="toggle('formater')" style="cursor: pointer;">输出数据处理</span>
            </a-divider>
            <a-row :gutter="[5, 10]" v-show="!apiHide.formater">
              <a-col :span="4">
                <a-tag class="center-100 height-24"><b>数据处理</b></a-tag>
              </a-col>
              <a-col :span="18">
                <a-button
                  v-if="item.formater.length === 0"
                  @click="addNode(false, false, item)"
                  type="dashed"
                  icon="plus"
                  size="small"
                  style="width: calc(100% - 160px);"
                >添加处理节点</a-button>
                <a-button
                  :disabled="!$store.state.extraClip"
                  @click="item.formater = item.formater.concat($store.state.extraClip)"
                  size="small"
                  style="margin-left: 5px; float: right;"
                >一键粘贴</a-button>
                <a-button
                  :disabled="!item.formater || !item.formater.length"
                  @click="$store.commit('updateExtraClip', item.formater)"
                  size="small"
                  style="margin-left: 5px; float: right;"
                >一键复制</a-button>
              </a-col>
              <a-col :span="2" class="right">
                <common-tip title="处理映射后的融合数据" />
              </a-col>
              <a-col :span="22" @click="popupReady.formater = false">
                <a-dropdown :trigger="['contextmenu']" :visible="popupReady.formater">
                  <a-tree
                    :default-expand-all="true"
                    :show-line="true"
                    :tree-data="item.formater"
                    :replace-fields="{ key: 'id', title: 'key' }"
                    @select="(selected, v) => onSelect(selected, v, item)"
                    @rightClick="(v) => onRightClick('formater', v, item)"
                  ></a-tree>
                  <a-menu slot="overlay" @click="popupReady.formater = false">
                    <a-menu-item @click="isEdit = true">编辑</a-menu-item>
                    <a-menu-item @click="$store.commit('updateExtraClip', editNode.dataRef)">一键复制</a-menu-item>
                    <a-menu-item
                      v-if="$store.state.extraClip"
                      @click="addNode($store.state.extraClip)"
                    >一键粘贴</a-menu-item>
                    <a-menu-item
                      v-if="editNode.dataRef && editNode.dataRef.type.includes('Parent')"
                      @click="addNode(false, true)"
                    >添加子级节点</a-menu-item>
                    <a-menu-item @click="addNode()">添加节点</a-menu-item>
                    <a-menu-item @click="deleteNode()">删除节点</a-menu-item>
                  </a-menu>
                </a-dropdown>
              </a-col>
              <a-col :span="4">
                <query-popover
                  name="数据清扫"
                  :map-data="item.deleter"
                  map-type="Deleter"
                  :api-data="item"
                  :sm="true"
                />
              </a-col>
              <a-col :span="18">
                <a-select
                  v-model="item.deleter"
                  :token-separators="[',']"
                  mode="tags"
                  size="small"
                />
              </a-col>
              <a-col :span="2" class="right">
                <common-tip title="去除无用的数据节点" />
              </a-col>
            </a-row>
            <a-divider orientation="right">
              <a-icon :type="apiHide.formater ? 'caret-left' : 'caret-up'" />
            </a-divider>
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
      <a-button
        class="drawer-bottom-btn"
        type="primary"
        @click="validate(true)"
        :loading="publishing"
      >测试环境部署</a-button>
      <a-button class="drawer-bottom-btn" @click="close">取消</a-button>
      <preview
        :id="form._id"
        :env="showHistory ? 'ex' : 'preview'"
        :gray="form.gray.type"
        :list="form.list"
        @preview="(id, env, gray) => $emit('preview', id, env, gray)"
      />
      <a-button
        v-if="!readOnly"
        class="drawer-bottom-btn"
        type="primary"
        @click="validate()"
        :loading="publishing"
      >{{ showHistory ? '回滚' : '提交' }}</a-button>
    </a-row>
    <a-modal v-model="isEdit" :width="1080" :zIndex="50" :closable="false" :footer="false">
      <a-card
        :body-style="{ fontSize: '14px', margin: '-1px 0 0 -1px', padding: '0' }"
        size="small"
        hoverable
        bordered
      >
        <!-- 映射 - 输出 -->
        <mapping-out :editNode="editNode.dataRef" :api-data="editApi" />
        <!-- 映射 - 输入 -->
        <mapping-in
          v-for="(mapItem, mapIndex) in nodeDataMapping"
          :key="mapIndex"
          :index="mapIndex"
          :map-data="nodeDataMapping"
          :map-type="(editNode.dataRef || {}).type"
          :map-sort="(editNode.dataRef || {}).sort"
          :api-data="editApi"
          :parent-input="editParentInput"
        />
      </a-card>
    </a-modal>
  </a-drawer>
</template>

<script>
import CommonTip from '../common/tip'
import CommonChildTree from '../common/childTree'
import CommonFormItemParams from '../common/formItemParams'
import QueryPopover from '../block/queryPopover'
import Preview from '../block/preview'
import Required from '../block/required'
import MappingOut from '../block/mappingOut'
import MappingIn from '../block/mappingIn'
import { http } from '../../utils/http'
import { prefix, suffix } from '../../utils/block'
import { addItem, deleteItem, copyItem } from '../../utils/tool'

const domain = 'localhost:3000/strategy'

export default {
  name: 'formDrawer',
  components: {
    QueryPopover,
    Required,
    Preview,
    MappingOut,
    MappingIn,
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
      formerApi: [],
      apiObj: {},
      apiHide: {},
      formatItemBlank: {
        type: 'String',
        key: '',
        mapping: [{ value: '', type: 'KEY', operation: '', required: [], kv2v: {}, link: {} }],
        sort: {},
        dup: {},
        a2o: { required: [] },
        children: []
      },
      rules: {
        _id: [{ validator: validateId, trigger: ['change', 'blur'] }],
        name: [{ required: true, message: '请填写模块名称', trigger: ['change', 'blur'] }],
        gray: [{ required: true, message: '请填写灰度规则', trigger: ['change', 'blur'] }],
        list: [{ validator: validateList, trigger: ['change', 'blur'] }]
      },
      formaterCollapse: true,
      popupReady: {
        api: false,
        formater: false
      },
      isEdit: false,
      editChildren: [],
      editNode: {},
      editIndex: 0,
      editParentInput: [],
      editApi: {}
    }
  },
  mounted() {
    this.getApi()
  },
  watch: {
    $route(to) {
      this.getApi()
    },
    isEdit(val) {
      if (!val) {
        this.$store.commit('updateInitTree', [])
      }
    }
  },
  computed: {
    platform() {
      return this.$route.params.platform
    },
    readOnly() {
      const role = (this.$store.state.user.role || '').split(',')
      const curPt = role.find(item => item.replace(/_READONLY$/, '') === (this.platform || '').toUpperCase())
      return /_READONLY$/.test(curPt || '')
    },
    cacheKeyOptions() {
      let result = [];
      this.form.list.map(item => item.api.map(api => (api.params || []).concat(api.body || []).map(param => {
        if (['INPUT', 'APPEND'].includes(param.type) && param._id && !result.includes(param._id)) {
          result.push(param._id)
        }
      })))
      return result.map(v => ({ key: v, title: v }));
    },
    nodeDataMapping() {
      return (this.editNode.dataRef || {}).mapping || [];
    }
  },
  methods: {
    addItem,
    deleteItem,
    async getApi() {
      this.api = (await http(`//${domain}/${this.platform}/interface`, {
        defaultData: [],
        params: {
          size: 200
        }
      })).map(item => {
        this.apiObj[item._id] = item
        item.hasQipu = !!item.qipuIdKey
        return item
      })
    },
    validate(isTest) {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (isTest) {
            this.$emit('postBlock', { isTest })
          } else if (this.form.isOnline) {
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
    getListApiOption(apiList, apiIndex, listIndex) {
      const currentApi = apiList[apiIndex] || {};
      if (!this.formerApi[listIndex]) {
        this.formerApi[listIndex] = []
      }
      // 去除多余记忆数据源
      this.formerApi[listIndex] = this.formerApi[listIndex].slice(0, apiList.length)
      // 位置发生变化时，更改记忆数据源
      if (currentApi.base) {
        this.formerApi[listIndex][apiIndex] = currentApi
      }
      return (this.formerApi[listIndex][apiIndex] ? [this.formerApi[listIndex][apiIndex]] : []).concat(this.api)
    },
    onSelect(selected, item, apiItem) {
      if (apiItem.api) {
        item.node.dataRef.isFormater = true
      }
      this.isEdit = true
      this.editApi = apiItem
      this.editNode = item.node
      const { dataRef } = item.node.$parent || {}
      if (dataRef && dataRef.type.includes('Parent')) {
        this.editParentInput = dataRef.mapping.map(item => item.value.replace(/\[\d+\]/g, '[*]'))
      } else {
        this.editParentInput = []
      }
    },
    onRightClick(type, item, apiItem, apiIndex) {
      this.popupReady[type] = type === 'api' ? apiIndex : true
      const { dataRef = {}, treeData = [] } = item.node.$parent || {}
      if ((dataRef.type || '').includes('Parent')) {
        this.editParentInput = dataRef.mapping.map(item => item.value.replace(/\[\d+\]/g, '[*]'))
      } else {
        this.editParentInput = []
      }
      if (apiItem.api) {
        item.node.dataRef.isFormater = true
      }
      this.editChildren = dataRef.children || apiItem.formater
      this.editApi = apiItem
      this.editNode = item.node
      this.editIndex = parseInt((this.editNode.pos || '').split('-').pop()) || 0
    },
    addNode(clip, addChild, apiItem) {
      const addItem = copyItem(clip || this.formatItemBlank)
      if (apiItem) {
        if (apiItem.api) {
          addItem.isFormater = true
        }
        this.editApi = apiItem
        this.editApi.formater.push(addItem)
      } else if (addChild) {
        const { children, mapping } = this.editNode.dataRef;
        this.editParentInput = mapping.map(item => item.value.replace(/\[\d+\]/g, '[*]'))
        children.push(addItem)
      } else {
        this.editChildren.splice(this.editIndex + 1, 0, addItem)
      }
      this.editNode = { dataRef: addItem }
      this.isEdit = true
      this.popupReady.api = false
      this.popupReady.formater = false
    },
    deleteNode() {
      this.editChildren.splice(this.editIndex, 1)
    },
    toggle(key) {
      this.apiHide = { ...this.apiHide, [key]: !this.apiHide[key] }
    },
    close() {
      this.popupReady.api = false
      this.popupReady.formater = false
      this.$emit('closeDrawer')
    },
    qipuIdConstChange(apiItem) {
      if (apiItem.qipuIdConst) {
        apiItem.qipuIdKeyEx = apiItem.qipuIdKey
        apiItem.qipuIdKey = apiItem.qipuIdValEx || ''
      } else {
        apiItem.qipuIdValEx = apiItem.qipuIdKey
        apiItem.qipuIdKey = apiItem.qipuIdKeyEx || ''
      }
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
.group-tag {
  text-align: center;
  font-size: 14px;
  padding-top: 1px;
  width: 50%;
  height: 24px;
}
</style>
