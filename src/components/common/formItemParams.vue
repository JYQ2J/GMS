<template>
  <a-row>
    <a-button
      block
      type="dashed"
      icon="plus"
      size="small"
      :class="btnClass"
      @click="$emit('addItem', list, { type: 'KV' })"
    >添加参数</a-button>
    <slot name="tip"></slot>
    <div v-for="(param, index) in list" :key="index">
      <a-input-group size="small" class="mt-10" compact>
        <a-select
          v-model="param.type"
          @change="typeChange(param)"
          :disabled="disableType"
          :options="typeOptions"
          placeholder="参数类型"
          size="small"
          class="right"
          style="width: 100px;"
        />
        <a-input
          v-model="param._id"
          placeholder="请输入参数字段名"
          size="small"
          style="width: calc(50% - 68px);"
        />
        <a-select
          v-if="apiItem._id && param.type === 'SIGN' && platform === 'pcw'"
          v-model="param.value"
          :options="signType"
          placeholder="请输入参数取值"
          size="small"
          style="width: calc(50% - 68px);"
        />
        <a-input
          v-else-if="apiItem._id"
          v-model="param.value"
          :placeholder="hideValueInput(param.type) ? '请输入参数默认值' : '请输入参数取值'"
          size="small"
          style="width: calc(50% - 68px);"
        />
        <a-select
          v-else-if="param.type === 'SIGN' && platform === 'pcw'"
          v-model="param.default"
          :options="signType"
          placeholder="请输入参数取值"
          size="small"
          style="width: calc(50% - 68px);"
        />
        <a-input
          v-else
          v-show="!hideValueInput(param.type)"
          v-model="param.default"
          placeholder="请输入参数默认值"
          size="small"
          style="width: calc(50% - 68px);"
        />
        <a-icon
          type="minus-circle"
          :style="{
            width: '36px',
            textAlign: 'right',
            padding: '5px 0',
            marginLeft: hideValueInput(param.type) && !apiItem._id  ? 'calc(50% - 68px)' : 0
          }"
          @click="$emit('deleteItem', list, index)"
        />
      </a-input-group>
      <a-input-group v-if="param.type === 'INHERIT'" size="small" compact>
        <a-select
          v-model="param.isFormat"
          :options="[
            { key: 0, title: '初始数据' },
            { key: 1, title: '格式数据' }
          ]"
          placeholder="格式化"
          size="small"
          style="width: 100px;"
        />
        <a-select
          v-model="param.from"
          :options="parentApiOption"
          placeholder="来源API"
          size="small"
          style="width: calc(50% - 68px);"
        />
        <a-select
          v-model="param.inherit"
          :options="[
            { key: 'single', title: '单值' },
            { key: 'join', title: '数组' },
            { key: 'multi', title: '批量' }
          ]"
          placeholder="单值"
          size="small"
          :style="`width: ${param.inherit === 'multi' ? 'calc(50% - 283px)' : (param.inherit === 'join' ? 'calc(50% - 122px)' : 'calc(50% - 68px)')};`"
        />
        <a-input-number
          v-if="param.inherit === 'multi'"
          style="width: 55px;"
          size="small"
          :min="1"
          v-model="param.chunkSize"
        />
        <a-input
          v-if="['multi', 'join'].includes(param.inherit)"
          v-model="param.splitKey"
          placeholder="分隔符"
          size="small"
          style="text-align: right; width: 55px;"
        />
        <a-input
          v-if="param.inherit === 'multi'"
          v-model="param.multiKey"
          placeholder="批量输出节点"
          size="small"
          style="text-align: right; width: 108px;"
        />
        <a-tooltip
          style="text-align: right; padding: 5px 0; width: 36px; color: #666;"
          :overlay-style="{ maxWidth: 'calc(100% - 520px)' }"
          placement="left"
          title="数组：数组参数，以分隔符连接进行请求； 批量：数组参数，以批量并发方式进行请求；"
        ><a-icon type="question-circle" /></a-tooltip>
      </a-input-group>
    </div>
  </a-row>
</template>

<script>
export default {
  name: 'formItemParams',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    disableType: {
      type: Boolean,
      default: false
    },
    api: {
      type: Array,
      default: () => []
    },
    apiItem: {
      type: Object,
      default: () => ({})
    },
    btnClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      signType: [
        { key: 'SIGN1', title: '签名1' }
      ]
    }
  },
  computed: {
    platform() {
      return this.$route.params.platform
    },
    typeOptions() {
      const result = [
        { key: 'INPUT', title: '输入参数' },
        { key: 'KV', title: 'KV' },
        { key: 'COOKIE', title: 'COOKIE' },
        { key: 'IP', title: 'IP' },
        { key: 'UA', title: 'UA' },
        { key: 'REFER', title: 'REFER' },
        { key: 'REQID', title: '请求ID' },
        { key: 'TIMESTAMP', title: '时间戳' },
        { key: 'SIGN', title: '签名' }
      ]
      if (this.parentApiOption.length > 0) {
        result.push({ key: 'INHERIT', title: '继承参数' })
      }
      return result
    },
    // 获取继承参数的数据源列表
    parentApiOption() {
      const [result, id] = [[], this.getApiId(this.apiItem)]
      this.api.map(item => {
        const itemId = this.getApiId(item)
        if (itemId !== id) {
          result.push({ key: itemId, title: itemId })
        }
      })
      return result
    }
  },
  methods: {
    typeChange(param) {
      if (param.type === 'SIGN') {
        param._id = 'sign';
      } else if (param.type === 'TIMESTAMP') {
        param._id = 'timestamp';
      }
    },
    getApiId(api) {
      return api.base ? api.base._id : api._id
    },
    hideValueInput(type) {
      return ['IP', 'UA', 'REFER', 'REQID', 'INPUT', 'TIMESTAMP'].includes(type)
    }
  }
}
</script>