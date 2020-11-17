<template>
  <div v-if="visibleIndex">
    <div class="shade-history" />
    <a-table
      class="table-history"
      size="small"
      :style="`top: ${visibleIndex * positionHeight + 121}px`"
      :pagination="false"
      :columns="columns"
      :loading="loading"
      :data-source="data"
      :row-key="dataKey"
    >
      <div slot="close">
        <a-icon type="close" @click="$emit('close')"></a-icon>
      </div>
      <div slot="operate" slot-scope="text, record">
        <a @click="$emit('edit', record, visibleIndex)">查看</a>
      </div>
    </a-table>
  </div>
</template>

<script>
export default {
  name: 'history',
  props: {
    visibleIndex: {
      type: Number,
      default: 0
    },
    positionHeight: {
      type: Number,
      default: 54
    },
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    dataKey: {
      type: String,
      default: '_id'
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.shade-history {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  margin: -68px -24px;
  background-color: rgb(0, 0, 0, 0.1);
}
.table-history {
  z-index: 10;
  width: calc(100% - 48px);
  margin-bottom: 24px;
  background-color: #fafafa;
  position: absolute;
  border-radius: 4px;
}
</style>