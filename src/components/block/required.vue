<template>
  <div>
    <a-button
      v-if="type === 'api'"
      @click="required.push({ type: 'MUST', variable: [variableBlank()] })"
      type="dashed"
      size="small"
      icon="plus"
      block
    >添加限制条件</a-button>
    <a-card
      v-if="type !== 'api' || required.length"
      size="small"
      hoverable
      :class="{ 'mt-10': type === 'api' }"
      :title="title"
      :head-style="{ fontSize: '14px', minHeight: '20px' }"
      :body-style="{ fontSize: '14px' }"
    >
      <a-button
        v-if="type === 'mapping'"
        @click="required.push({ type: 'MUST', variable: [variableBlank()] })"
        slot="extra"
        style="height: 22px; padding: 0 5px;"
      ><a-icon type="plus" style="height: 16px;" /></a-button>
      <a-card-grid
        v-for="(r, rIndex) in required"
        :key="rIndex"
        style="width: 100%; padding: 10px;"
        size="small"
      >
        <a-row>
          <a-radio-group v-model="r.type" class="center" size="small">
            <a-radio-button value="MUST" style="width: 99px;">必要条件</a-radio-button>
            <a-radio-button value="SHOULD" style="width: 99px;">充分条件</a-radio-button>
          </a-radio-group>
          <a-icon
            type="delete"
            theme="twoTone"
            style="float: right; font-size: 16px; width: 26px; line-height: 24px;"
            @click="required.splice(rIndex, 1)"
          />
        </a-row>
        <a-row v-for="(v, vIndex) in r.variable" :key="vIndex" :index="vIndex" class="mt-5">
          <a-input-group compact size="small" style="width: calc(100% - 26px);">
            <a-select
              v-model="v.type"
              :options="[
                { key: 'KEY', title: keyProp[type].name },
                { key: 'VALUE', title: '常量' },
              ]"
              :style="`width: ${keyProp[type].width}px;`"
              placeholder="类型"
              size="small"
            />
            <a-select
              v-if="type === 'mapping'"
              v-model="v.field"
              :disabled="v.type === 'VALUE' || v.operation === 'FIND'"
              :options="[
                { key: 'LOCAL', title: '局部' },
                { key: 'GLOBAL', title: '全局' },
              ]"
              placeholder="域"
              size="small"
              style="width: 65px;"
            />
            <a-select
              v-model="v.operation"
              :options="vIndex ? operations : [
                { key: '!!', title: '存在' },
                { key: '!', title: '非' }
              ].concat(type === 'mapping' ? [{ key: 'FIND', title: '过滤' }] : [])"
              placeholder="运算"
              size="small"
              style="width: 70px;"
            />
            <a-input v-model="v.value" :style="`width: calc(100% - 210px); text-align: right;`" />
          </a-input-group>
          <a-icon
            v-if="vIndex"
            class="card-right-icon"
            type="minus-circle"
            theme="twoTone"
            style="font-size: 16px; width: 26px;"
            @click="r.variable.splice(vIndex, 1)"
          />
          <a-icon
            v-else-if="(r.variable || []).every(v => (
              !['!', '==', '!=', '>', '>=', '<', '<=', 'REGEX', 'WEEK', 'MONTH', 'YEAR', 'ENTITY'].includes(v.operation)
            ))"
            class="card-right-icon"
            type="plus-circle"
            theme="twoTone"
            style="font-size: 16px; width: 26px;"
            @click="r.variable.push(variableBlank(r.variable))"
          />
        </a-row>
      </a-card-grid>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'preview',
  props: {
    title: String,
    type: {
      type: String,
      default: 'mapping'
    },
    required: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyProp: {
        api: {
          name: '输入参数',
          width: 130
        },
        mapping: {
          name: '节点',
          width: 65
        }
      },
      operations: [
        { key: '==', title: '==' },
        { key: '!=', title: '!=' },
        { key: '>', title: '>' },
        { key: '>=', title: '>=' },
        { key: '<', title: '<' },
        { key: '<=', title: '<=' },
        { key: '+', title: '加' },
        { key: '-', title: '减' },
        { key: '*', title: '乘' },
        { key: '/', title: '除' },
        { key: 'WEEK', title: '星期' },
        { key: 'MONTH', title: '月份' },
        { key: 'YEAR', title: '年份' },
        { key: 'ENTITY', title: '实体' },
        { key: 'REGEX', title: '正则' }
      ]
    }
  },
  methods: {
    variableBlank(variable = []) {
      return {
        field: 'LOCAL',
        operation: variable.length ? '==' : '!!',
        type: 'KEY',
        value: ''
      }
    }
  }
}
</script>