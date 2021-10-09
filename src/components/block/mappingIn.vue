<template>
  <!-- 映射 - 输入 -->
  <a-card-grid style="width: 100%; padding: 12px;">
    <a-row>
      <a-col :span="4">
        <a-checkable-tag v-model="checked" class="width-90 center" style="cursor: pointer;" @change="checkedChange">
          <a-icon type="retweet" style="margin-right: 8px;" />
          <b>输入 - {{ index + 1 }}</b>
        </a-checkable-tag>
      </a-col>
      <a-col :span="19" v-if="mapType.includes('X2O')">
        <a-select
          v-model="x2oKey"
          :token-separators="[',']"
          @change="x2oChange"
          mode="tags"
          placeholder="请添加需要转化为对象属性的节点"
          style="width: 100%"
        />
      </a-col>
      <a-col :span="19" v-else>
        <a-input-group compact size="small">
          <a-select
            v-model="mapItem.type"
            :disabled="mapItem.operation === 'TIMESTAMP'"
            :options="[
              { key: 'KEY', title: '节点' },
              { key: 'VALUE', title: '常量' },
              { key: 'INDEX', title: 'Index' },
              { key: 'INDEX+', title: '序号' },
              { key: 'INPUT', title: '参数' },
              { key: 'KV2V', title: 'KV值' },
              { key: 'RULE', title: '规则' },
              { key: 'EVAL', title: 'Eval' },
            ]"
            default-value="KEY"
            placeholder="输入节点"
            size="small"
            style="width: 77px;"
          />
          <a-select
            v-model="mapItem.field"
            :disabled="['VALUE', 'INDEX', 'INDEX+', 'INPUT'].includes(mapItem.type) || mapItem.operation === 'TIMESTAMP'"
            :options="[
              { key: 'LOCAL', title: '局部' },
              { key: 'GLOBAL', title: '全局' },
            ]"
            default-value="LOCAL"
            placeholder="域"
            size="small"
            style="width: 65px;"
          />
          <a-select
            v-model="mapItem.operation"
            :options="index ? opList.concat(calList) : opList"
            :dropdownMatchSelectWidth="false"
            placeholder="或"
            size="small"
            style="width: 70px;"
          />
          <a-select
            v-if="mapItem.type === 'RULE'"
            class="right-select"
            size="small"
            v-model="mapItem.value"
            :options="ruleList"
            :showArrow="false"
            :style="`width: calc(100% - ${['SPLIT', 'ELLIPSIS'].includes(mapItem.operation) ? 280 : 210}px); text-align: right;`"
          />
          <a-input
            v-else
            v-model="mapItem.value"
            :placeholder="mapItem.operation === 'TIMESTAMP' ? '当前时间戳毫秒数' : '请填入正确的输入节点'"
            :disabled="mapItem.type === 'VALUE' && mapType.includes('Parent') || mapItem.type.includes('INDEX') || mapItem.operation === 'TIMESTAMP'"
            @blur="valueBlur"
            :style="`width: calc(100% - ${['SPLIT', 'ELLIPSIS'].includes(mapItem.operation) ? 280 : 210}px); text-align: right;`"
          />
          <a-input
            v-if="mapItem.operation === 'SPLIT'"
            v-model="mapItem.splitKey"
            placeholder="分割符"
            style="width: 70px; text-align: right;"
          />
          <a-input
            v-if="mapItem.operation === 'ELLIPSIS'"
            v-model="mapItem.splitKey"
            placeholder="限制数"
            style="width: 70px; text-align: right;"
          />
        </a-input-group>
      </a-col>
      <a-col :span="1" class="right">
        <a-icon
          v-if="index"
          type="minus-circle"
          theme="twoTone"
          style="font-size: 18px; vertical-align: middle;"
          @click="deleteItem(mapData, index)"
        />
        <a-icon
          v-else-if="mapItem.type !== 'EVAL'"
          type="plus-circle"
          theme="twoTone"
          style="font-size: 18px; vertical-align: middle;"
          @click="addItem(mapData, { value: '', type: 'KEY', operation: '', required: [], kv2v: {}, link: {} }, true)"
        />
      </a-col>
    </a-row>
    <a-row class="mt-10">
      <a-col :span="4">
        <query-popover
          btn-style="margin: 4px 0; width: 90px;"
          :index="index"
          :map-data="mapData"
          :map-type="mapType"
          :api-data="apiData"
          :parent-input="parentInput"
        />
      </a-col>
      <a-col
        v-if="mapItem.type === 'KV2V'"
        :span="19"
        style="margin-top: 4px;"
      >
        <a-input
          v-model="mapItem.kv2v.key"
          @blur="() => mapItem.kv2v.key = (mapItem.kv2v.key || '').trim()"
          addon-before="Key"
          style="text-align: right; width: 175px; margin-right: 10px;"
        />
        <a-input
          v-model="mapItem.kv2v.value"
          @blur="() => mapItem.kv2v.value = (mapItem.kv2v.value || '').trim()"
          addon-before="Value"
          style="text-align: right; width: 175px; margin-right: 10px;"
        />
        <a-input
          v-model="mapItem.kv2v.keyName"
          @blur="() => mapItem.kv2v.keyName = (mapItem.kv2v.keyName || '').trim()"
          addon-before="Key-Name"
          style="text-align: right; width: calc(100% - 370px);"
        />
      </a-col>
      <a-col v-if="mapItem.type === 'KV2V'" :span="1" class="right mt-10">
        <common-tip title="将KV数组中的某个Value属性直接输出，如：[{ name: 'a', value: '1', name: 'b', value: '2' }] 输出 name等于b的value（2）" />
      </a-col>
      <a-col
        v-if="mapItem.operation === 'LINK'"
        :offset="mapItem.type === 'KV2V' ? 4 : 0"
        :span="19"
        style="margin-top: 4px;"
      >
        <a-input
          v-model="mapItem.link.sizeDefault"
          @blur="() => mapItem.link.sizeDefault = (mapItem.link.sizeDefault || '').trim()"
          addon-before="默认尺寸"
          style="text-align: right; width: 175px; margin-right: 10px;"
        />
        <a-input
          v-model="mapItem.link.size1x"
          @blur="() => mapItem.link.size1x = (mapItem.link.size1x || '').trim()"
          addon-before="1倍图尺寸"
          style="text-align: right; width: 175px; margin-right: 10px;"
        />
        <a-switch
          checked-children="有2倍图"
          un-checked-children="无2倍图"
          v-model="mapItem.link.has2x"
          @change="val => (!val) && (mapItem.link.size2x = '')"
          style="width: 100px; margin: 5px 10px 5px 0;"
        />
        <a-input
          v-model="mapItem.link.size2x"
          :disabled="!mapItem.link.has2x"
          @blur="() => mapItem.link.size2x = (mapItem.link.size2x || '').trim()"
          addon-before="2倍图尺寸"
          style="text-align: right; width: 175px; margin-right: 40px;"
        />
        <a-switch
          checked-children="去除HTTP"
          un-checked-children="保留HTTP"
          v-model="mapItem.link.removeHttp"
          style="width: 100px; margin: 5px 0;"
        />
      </a-col>
      <a-col v-if="mapItem.operation === 'LINK'" :span="1" class="right mt-10">
        <common-tip title="常见的处理资源链接的方法（如：图片尺寸拼接，http协议名去除等）" />
      </a-col>
      <a-col :offset="gapStyle ? 4 : 0" :span="19" :class="{ 'mt-10': gapStyle }">
        <a-textarea
          v-if="mapItem.type === 'EVAL'"
          v-model="mapItem.eval"
          :auto-size="{ minRows: 10 }"
          placeholder="请输入要执行的代码"
        />
        <required v-else title="约束条件" :required="mapItem.required" />
      </a-col>
      <a-col v-if="mapItem.type !== 'EVAL'" :span="1" :class="`right ${gapStyle ? 'mt-20' : 'mt-10'}`">
        <common-tip title="约束条件用于控制是否使用该输入逻辑，若不满足下述条件，则进入下一个输入映射逻辑" />
      </a-col>
    </a-row>
  </a-card-grid>
</template>

<script>
import CommonTip from '../common/tip'
import Required from '../block/required'
import QueryPopover from '../block/queryPopover'
import { http } from '../../utils/http'
import { addItem, deleteItem } from '../../utils/tool'
export default {
  name: 'mappingIn',
  components: {
    Required,
    CommonTip,
    QueryPopover
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: 0
    },
    mapData: {
      type: Array,
      default: () => []
    },
    mapType: {
      type: String,
      default: 'String'
    },
    mapSort: {
      type: Object,
      default: () => {}
    },
    apiData: {
      type: Object,
      default: () => {}
    },
    parentInput: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      lock: false,
      active: false,
      checked: false,
      x2oKey: [],
      opList: [
        { key: '', title: '或' },
        { key: 'W', title: '万' },
        { key: 'TIMESTAMP', title: '当前时间戳' },
        { key: 'T2V', title: '转换时间戳' },
        { key: 'T2Y', title: '年份' },
        { key: 'T2YMD', title: '日期' },
        { key: 'YMD', title: '毫秒=>日期' },
        { key: 'YEAR', title: '毫秒=>年' },
        { key: 'MONTH', title: '毫秒=>月' },
        { key: 'WEEK', title: '毫秒=>星期' },
        { key: 'LINK', title: '链接' },
        { key: 'SPLIT', title: '分割' },
        { key: 'ELLIPSIS', title: '字符串省略' },
        { key: 'SCORE', title: '评分' },
      ],
      calList: [
        { key: '+', title: '加' },
        { key: '-', title: '减' },
        { key: '*', title: '乘' },
        { key: '/', title: '除' },
      ],
      ruleList: [
        { key: 'G_CORNER_MARK', title: '通用角标逻辑 - G_CORNER_MARK' },
        { key: 'G_META', title: '通用底标逻辑 - G_META' },
        { key: 'G_URL', title: '通用跳转链接 - G_URL' },
        { key: 'OTHER_CORNER_MARK', title: '角标（其它）- OTHER_CORNER_MARK' },
        { key: 'QIPU_META', title: '奇谱列表底标 - QIPU_META' },
        { key: 'G_PAY_MARK', title: 'PayMark数值 - G_PAY_MARK' },
        { key: 'G_IS_SERIES', title: '是否剧集类 - G_IS_SERIES' },
        { key: 'G_IS_SOURCE', title: '是否来源类 - G_IS_SOURCE' },
        { key: 'G_IS_SOLO', title: '是否单视频 - G_IS_SOLO' },
        { key: 'G_SUBKEY', title: '订阅ID（收藏接口使用）- G_SUBKEY' },
        { key: 'G_SUBTYPE', title: '订阅类型（收藏接口使用）- G_SUBTYPE' },
        { key: 'SO_CID', title: '搜索-频道ID - SO_CID' },
        { key: 'SO_CORNER_MARK', title: '搜索-角标 - SO_CORNER_MARK' },
        { key: 'SO_CORNER_MARK_S', title: '搜索-列表角标（小）- SO_CORNER_MARK_S' },
        { key: 'SO_META', title: '搜索-底标 - SO_META' },
        { key: 'SO_META_S', title: '搜索-列表底标（小）- SO_META_S' },
        { key: 'SO_CATEGORY', title: '搜索-类型标签 - SO_CATEGORY' },
      ]
    }
  },
  computed: {
    platform() {
      return this.$route.params.platform
    },
    mapItem() {
      return this.mapData[this.index]
    },
    gapStyle() {
      return this.mapItem.type === 'KV2V' || this.mapItem.operation === 'LINK'
    },
    initTree() {
      return this.$store.state.initTree || []
    }
  },
  watch: {
    '$store.state.transIndex'(val) {
      if (val === -1) {
        this.checked = false
      }
    },
    'mapItem.value'(val) {
      if (val) {
        this.x2oKey = val.split(',')
      } else {
        this.x2oKey = []
      }
    }
  },
  methods: {
    addItem,
    deleteItem,
    checkedChange(val) {
      const transIndex = this.$store.state.transIndex;
      if (val) {
        if (transIndex >= 0) {
          this.mapData.splice(transIndex, 1, ...this.mapData.splice(this.index, 1 , this.mapData[transIndex]));
          this.$store.commit('updateTransIndex', -1)
        } else {
          this.$store.commit('updateTransIndex', this.index)
        }
      } else {
        this.$store.commit('updateTransIndex', -1)
      }
    },
    x2oChange(val) {
      this.mapItem.value = val.join(',')
    },
    valueBlur() {
      if (this.mapItem.type !== 'VALUE') {
        this.mapItem.value = (this.mapItem.value || '').trim()
      }
      if ((this.apiData.base || this.apiData)._id === 'GetEntity' && this.mapItem.value.endsWith('elements_summary')) {
        this.mapSort.key = 'order'
        this.mapSort.order = 'asc'
      }
    }
  }
}
</script>