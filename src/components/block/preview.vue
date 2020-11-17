<template>
  <a-dropdown placement="topCenter">
    <slot>
      <a-button
        class="drawer-bottom-btn" 
        shape="round"
        icon="eye"
        type="dashed"
        @click="$emit('preview', id, env)"
      >预览</a-button>
    </slot>
    <a-menu v-if="list.length > 1" slot="overlay" style="bottom: 8px;">
      <a-menu-item
        v-for="(item, index) in isGray ? list : []"
        :key="index"
        @click="$emit('preview', id, env, item.gray)"
      >预览（灰度: {{ item.gray }}）</a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
export default {
  name: 'preview',
  props: {
    id: String,
    env: {
      type: String,
      default: 'prod'
    },
    gray: {
      type: String,
      default: 'NONE'
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isGray() {
      return this.gray && this.gray !== 'NONE'
    }
  }
}
</script>

<style scoped>
.drawer-bottom-btn {
  margin: 16px 35px;
}
</style>