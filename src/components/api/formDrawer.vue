<template>
  <a-drawer
    title="数据源编辑"
    width="calc(100% - 200px)"
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
      <a-form-model-item required label="接口ID" prop="_id">
        <a-input
          v-model="form._id"
          :disabled="!!currentId"
          placeholder="请输入标识接口的唯一ID，不能与已有的接口ID重复"
          class="tip-item"
        />
      </a-form-model-item>
      <a-form-model-item required label="接口名称" prop="name">
        <a-input v-model="form.name" placeholder="请简述接口用途" class="tip-item" />
      </a-form-model-item>
      <a-form-model-item required label="接口地址" prop="url">
        <a-input v-model="form.url" placeholder="请输入接口请求地址" class="tip-item" />
      </a-form-model-item>
      <a-form-model-item required label="超时时间" prop="timeout">
        <a-input-number
          :min="0"
          v-model="form.timeout"
          placeholder="请输入接口超时时间/ms"
          class="tip-item"
        />
      </a-form-model-item>
      <a-form-model-item required label="请求方式" prop="method">
        <a-select
          v-model="form.method"
          :options="[
            { key: 'GET', title: 'GET' },
            { key: 'POST', title: 'POST' }
          ]"
          placeholder="请输入接口请求方式"
          style="width: calc(100% - 36px);"
        />
      </a-form-model-item>
      <a-form-model-item label="缓存策略" prop="timeout">
        <a-input-group compact style="width: calc(50% - 36px);">
          <a-tag class="tag-text">缓存时间</a-tag>
          <a-input-number style="width: calc(100% - 100px);" :min="0" v-model="form.cache.time" />
        </a-input-group>
        <a-input-group compact style="width: 50%;">
          <a-tag class="tag-text">缓存参数</a-tag>
          <a-select
            v-model="form.cache.key"
            :options="form.params.filter(item => item._id).map(item => ({ key: item._id, title: item._id }))"
            mode="multiple"
            placeholder="请输入接口缓存关联的键值"
            style="width: calc(100% - 80px);"
          />
        </a-input-group>
        <common-tip class="ml-16" title="基于接口参数，接口缓存的Key值，可选多个" />
      </a-form-model-item>
      <a-form-model-item label="Headers" prop="params">
        <common-form-item-params
          btn-class="tip-item"
          :list="form.headers"
          @addItem="addItem"
          @deleteItem="deleteItem"
        ><common-tip class="ml-16" slot="tip" title="接口请求中的请求头数据" /></common-form-item-params>
      </a-form-model-item>
      <a-form-model-item label="URL Params" prop="params">
        <common-form-item-params
          btn-class="tip-item"
          :list="form.params"
          @addItem="addItem"
          @deleteItem="deleteItem"
        ><common-tip class="ml-16" slot="tip" title="GET/POST请求中的URL参数" /></common-form-item-params>
      </a-form-model-item>
      <a-form-model-item v-if="form.method === 'POST'" label="Post Body" prop="params">
        <common-form-item-params
          btn-class="tip-item"
          :list="form.body"
          @addItem="addItem"
          @deleteItem="deleteItem"
        ><common-tip class="ml-16" slot="tip" title="POST请求中的请求Body数据" /></common-form-item-params>
      </a-form-model-item>
      <a-form-model-item label="基础数据">
        <a-input
          addon-before="实体ID-输入节点"
          placeholder="请输入数据源接口中对应的实体ID字段节点映射"
          style="width: calc(60% - 36px);"
          v-model="form.qipuIdKey"
        />
        <common-tip class="ml-16" title="实体ID字段节点映射可以为多维数组中的节点，数组节点请在上方填写" />
        <a-input
          addon-before="输出字段"
          placeholder="请输入实体结构输出的字段名"
          style="width: calc(35% - 36px); margin-left: 5%"
          v-model="form.qipuDataKey"
        />
        <common-tip class="ml-16" title="模块的输出映射中，输出实体数据时使用" />
      </a-form-model-item>
    </a-form-model>
    <a-row
      type="flex"
      align="middle"
      justify="center"
      class="drawer-bottom"
    >
      <a-button class="drawer-bottom-btn" @click="$emit('closeDrawer')">
        取消
      </a-button>
      <a-button class="drawer-bottom-btn" type="primary" @click="validate">
        {{ showHistory ? '回滚' : '提交' }}
      </a-button>
    </a-row>
  </a-drawer>
</template>

<script>
import CommonTip from '../common/tip'
import CommonChildTree from '../common/childTree'
import CommonFormItemParams from '../common/formItemParams'
export default {
  name: 'formDrawer',
  components: {
    CommonTip,
    CommonChildTree,
    CommonFormItemParams
  },
  props: ['visible', 'form', 'currentId', 'showHistory'],
  data() {
    const validateId = (rule, id, callback) => {
      if (/^[A-Za-z0-9]+$/.test(id)) {
        callback()
      } else if (id) {
        callback(new Error('接口ID仅允许输入26个大小写英文字母和数字，请检查并修改'))
      } else {
        callback(new Error('请填写接口ID'))
      }
    }
    const validateParams = (rule, params, callback) => {
      if (params.some(item => !item.type || !item._id)) {
        callback(new Error('请正确填写接口参数'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        _id: [{ validator: validateId, trigger: ['change', 'blur'] }],
        name: [{ required: true, message: '请填写接口名称', trigger: ['change', 'blur'] }],
        url: [{ required: true, message: '请填写接口地址', trigger: ['change', 'blur'] }],
        timeout: [{ required: true, message: '请填写接口超时时间', trigger: ['change', 'blur'] }]
      }
    }
  },
  methods: {
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
          this.$emit('postApi')
        }
      })
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
  line-height: 30px;
  width: 80px;
  text-align: center;
}
</style>
