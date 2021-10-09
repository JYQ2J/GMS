<template>
  <a-popover v-model="active" trigger="click" :placement="placement">
    <a-row slot="content" style="width: 933px; max-height: 360px; overflow: auto;">
      <a-col v-if="lock" :span="24" class="center"><a-spin /></a-col>
      <a-tree
        v-else
        :default-expand-all="true"
        :tree-data="initTree"
        @select="onSelect"
      ></a-tree>
    </a-row>
    <a-button :size="sm ? 'small' : 'default'" icon="file-search" @click="query()" :style="btnStyle">{{ name }}</a-button>
  </a-popover>
</template>

<script>
import { http } from '../../utils/http'
import { handlePostBlock } from '../../utils/tool'

const domain = 'localhost:3000/strategy'

export default {
  name: 'queryPopover',
  props: {
    name: {
      type: String,
      default: '查询'
    },
    placement: {
      type: String,
      default: 'bottomLeft'
    },
    sm: {
      type: Boolean,
      default: false
    },
    btnStyle: {
      type: String,
      default: 'width: 100%; vertical-align: top;'
    },
    index: {
      type: Number,
      default: 0
    },
    mapKey: {
      type: String,
      default: 'value'
    },
    mapData: {
      type: Array,
      default: () => []
    },
    mapType: {
      type: String,
      default: 'String'
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
      active: false
    }
  },
  computed: {
    platform() {
      return this.$route.params.platform
    },
    initTree() {
      return this.$store.state.initTree || []
    }
  },
  methods: {
    handleInherit(paramList) {
      return paramList.map(item => item.type === 'INHERIT' ? ({
        type: 'KV',
        _id: item._id,
        value: item.default
      }) : item)
    },
    async query() {
      if (!this.lock && !this.initTree.length) {
        this.lock = true
        let result = {}
        if (this.apiData.api) {
          result = (await http(`//${domain}/${this.platform}/data/q/preview`, {
            method: 'POST',
            data: handlePostBlock({ list: [this.apiData], gray: { type: 'NONE' } }, this.$store.state.user.name, true)
          })).formatData || {}
        } else {
          const { _id, qipuDataKey, base, params = [], body = [], headers = [] } = this.apiData
          const api = [{
            ...this.apiData,
            params: this.handleInherit(params),
            body: this.handleInherit(body),
            headers: this.handleInherit(headers),
            base: base ? base._id : _id,
            formater: []
          }]
          result = (await http(`//${domain}/${this.platform}/data/q/initData`, {
            method: 'POST',
            data: {
              list: [{ api }]
            }
          }))[_id] || {}
          // 缩减奇谱数据，提升渲染性能
          if (result[qipuDataKey]) {
            result[qipuDataKey] = Object.values(result[qipuDataKey])[0] || {}
          }
        }
        this.$store.commit('updateInitTree', result)
        this.lock = false
      }
    },
    onSelect(selected, item) {
      let key = selected[0].replace(/\[\d+\]/g, '[*]')
      let parentKey = this.parentInput.find(v => key.includes(v))
      if (parentKey) {
        if (key.includes(parentKey + '.')) {
          key = key.split(parentKey + '.')[1]
        } else if (key.includes(parentKey + '[*].')) {
          key = key.split(parentKey + '[*].')[1]
        }
      }
      if (this.mapType === 'Deleter') {
        this.mapData.push(key)
      } else if (this.mapType.includes('X2O') && this.mapData[this.index][this.mapKey]) {
        this.mapData[this.index][this.mapKey] += `,${key}`
      } else {
        this.mapData[this.index][this.mapKey] = key
      }
    }
  }
}
</script>