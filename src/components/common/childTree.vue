<template>
  <a-row :style="rowStyle">
    <a-card
      size="small"
      :body-style="{ fontSize: '14px', ...bodyStyle }"
      :hoverable="bordered"
      :bordered="bordered"
    >
      <slot :data="data" :parent-array="parentArray" :index="dataIndex"></slot>
    </a-card>
    <a-divider v-if="showChildren" orientation="left">
      <a-button
        v-if="data.children.length"
        @click="$store.commit('updateChildrenClip', data.children)"
        icon="copy"
        style="margin-right: 10px;"
      >一键复制</a-button>
      <a-button
        v-else
        @click="data.children = $store.state.childrenClip"
        icon="copy"
        style="margin-right: 10px;"
      >一键粘贴</a-button>
      <a-icon v-if="hide" type="caret-right" style="margin-right: 10px;" @click="hide = false" />
      <a-icon v-else type="caret-down" style="margin-right: 10px;" @click="hide = true" />
      <span @click="hide = !hide" style="cursor: pointer;">{{ `${data.key || data._id} ${childLabel}` }}</span>
      <common-tip class="ml-16" title="子级节点支持递归嵌套" placement="right" />
    </a-divider>
    <a-row v-show="!hide">
      <child-tree
        v-for="(item, index) in children"
        v-slot="childProps"
        :key="index"
        :data="item"
        :data-index="index"
        :parent-array="children"
        :add-function="addFunction"
        :add-blank="copyItem(addBlank)"
        :bordered="bordered"
        :style="rowStyle"
        :body-style="bodyStyle"
      >
        <slot :data="childProps.data" :parent-array="childProps.parentArray" :index="childProps.index"></slot>
      </child-tree>
      <a-button
        v-if="showChildren"
        @click="addFunction(children, copyItem(addBlank), true)"
        type="dashed"
        icon="plus"
        size="small"
        block
      >添加<b> {{ data.key }} </b>子级节点</a-button>
    </a-row>
    <a-divider v-if="showChildren" orientation="right">
      <a-icon v-if="hide" type="caret-left" />
      <a-icon v-else type="caret-up" />
    </a-divider>
  </a-row>
</template>

<script>
import { copyItem } from '../../utils/tool'
import CommonTip from '../common/tip'

export default {
  name: 'childTree',
  components: {
    CommonTip
  },
  props: {
    rowStyle: {
      type: String,
      default: ''
    },
    bodyStyle: {
      type: Object,
      default: () => ({})
    },
    bordered: {
      type: Boolean,
      default: true
    },
    childLabel: {
      type: String,
      default: '子级属性'
    },
    data: {
      type: Object,
      default: () => ({})
    },
    dataIndex: {
      type: Number,
      default: 0
    },
    parentArray: {
      type: Array,
      default: () => []
    },
    addFunction: {
      type: Function,
      default: () => {}
    },
    addBlank: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    children() {
      return this.showChildren && this.data.children || []
    },
    showChildren() {
      return (this.data.type || '').includes('Parent')
    }
  },
  data() {
    return {
      hide: false
    }
  },
  methods: {
    copyItem,
    toggle() {
      this.hide = !this.hide
    }
  }
}
</script>