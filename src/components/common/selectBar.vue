<template>
  <a-row align="middle" style="margin-bottom: 12px;">
    <a-button
      v-if="leftBtn"
      class="fl"
      type="primary"
      :icon="leftBtn.icon"
      @click="$emit('leftBtnClick')"
    >{{ leftBtn.text }}</a-button>
    <a-select
      v-for="(item, index) in selectList"
      class="fl ml-24"
      show-search
      :key="index"
      :style="{ width: item.width || '100px' }"
      :default-value="item.defaultValue"
    >
      <a-select-option
        :key="''"
        @click="keySelect(item.key, '')"
      >{{ '全部' + item.label }}</a-select-option>
      <a-select-option
        v-for="option in item.options"
        :key="option.key"
        @click="keySelect(item.key, option.key)"
      >{{ option.title }}</a-select-option>
    </a-select>
    <a-input-group v-if="selectOptions.length" class="fl ml-24" compact>
      <a-select
        style="width: 100px;"
        :default-value="selectKey"
        :options="selectOptions"
        @change="selectChange"
      />
      <a-input
        v-if="selectList.length"
        v-model="selectValue"
        style="width: 200px;"
        @keydown.enter="search(selectValue)"
      />
      <a-input-search
        v-else
        v-model="selectValue"
        style="width: 600px;"
        @search="search"
      />
    </a-input-group>
    <a-button
      v-if="selectList.length"
      class="fl ml-24"
      shape="circle"
      @click="search(selectValue)"
    ><a-icon type="search" /></a-button>
  </a-row>
</template>

<script>
export default {
  name: 'commonSelectBar',
  props: {
    leftBtn: {
      type: Object,
      default: null
    },
    selectList: {
      type: Array,
      default: () => []
    },
    selectOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectKey: (this.selectOptions[0] || {}).key,
      selectValue: '',
      params: {}
    }
  },
  methods: {
    keySelect(key, value) {
      if (key && (value || value === 0)) {
        this.params[key] = value
      } else {
        delete this.params[key]
      }
    },
    selectChange(key, item) {
      this.selectKey = key
    },
    search(value) {
      this.selectOptions.map(item => delete this.params[item.key])
      if (value) {
        this.params[this.selectKey] = value
      } else {
        delete this.params[this.selectKey]
      }
      this.$emit('search', this.params)
    }
  }
};
</script>