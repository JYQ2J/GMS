<template>
  <a-card-meta style="padding: 12px; height: auto;">
    <!-- 映射 - 输出 - 基本配置 -->
    <a-row slot="title">
      <a-col :span="4">
        <query-popover
          v-if="editNode.isFormater"
          name="选择"
          map-key="key"
          btn-style="vertical-align: top; width: 90px;"
          :map-data="[editNode]"
          :map-type="editNode.type"
          :api-data="apiData"
          :sm="true"
        />
        <a-tag v-else class="width-90 center"><b>输出字段</b></a-tag>
      </a-col>
      <a-col :span="19">
        <a-input-group compact size="small">
          <a-select
            v-model="editNode.type"
            :options="[
              { key: 'String', title: '字符串' },
              { key: 'Number', title: '数字' },
              { key: 'Boolean', title: '布尔值' },
              { key: 'Object', title: '对象' },
              { key: 'Array', title: '数组' },
              { key: 'A2O', title: '数组->对象' },
              { key: 'X2O', title: 'X->对象' },
              { key: 'Parent-O', title: '父级对象' },
              { key: 'Parent-A', title: '父级数组' },
              { key: 'Parent-A2O', title: '父级数组->对象' },
              { key: 'Parent-X2O', title: '父级X->对象' }
            ]"
            placeholder="String"
            default-value="asc"
            size="small"
            style="width: 210px;"
          />
          <a-input
            v-model="editNode.key"
            @blur="() => editNode.key = (editNode.key || '').trim()"
            size="small"
            style="text-align: right; width: calc(100% - 210px);"
          />
        </a-input-group>
      </a-col>
    </a-row>
    <!-- 映射 - 输出 - 数组转对象数据配置 -->
    <a-row slot="description" v-if="(editNode.type || []).includes('A2O')">
      <a-col :span="7" :offset="4">
        <a-input
          v-model="editNode.a2o.key"
          @blur="() => editNode.a2o.key = (editNode.a2o.key || '').trim()"
          addon-before="Key"
          size="small"
          style="text-align: right; width: 210px;"
        />
      </a-col>
      <a-col :span="5" class="center">
        <a-switch
          checked-children="允许多值"
          un-checked-children="单值"
          v-model="editNode.a2o.multi"
        />
      </a-col>
      <a-col :span="7" class="right">
        <a-input
          v-model="editNode.a2o.value"
          @blur="() => editNode.a2o.value = (editNode.a2o.value || '').trim()"
          addon-before="Value"
          size="small"
          style="text-align: right; width: 210px;"
        />
      </a-col>
      <a-col :span="19" :offset="4" class="mt-10">
        <required title="约束条件" :required="editNode.a2o.required" />
      </a-col>
      <a-col :span="1" class="right mt-20">
        <common-tip title="约束条件用于控制是否使用该输入逻辑，若不满足下述条件，则进入下一个输入映射逻辑" />
      </a-col>
    </a-row>
    <!-- 映射 - 输出 - 数组数据配置 -->
    <a-row slot="description" v-if="['Array', 'Parent-A'].includes(editNode.type)">
      <a-col :span="19" :offset="4">
        <a-input-group compact size="small" style="width: 210px; display: inline-block;">
          <a-select
            v-model="editNode.sort.order"
            :options="[
              { key: 'asc', title: '升序' },
              { key: 'desc', title: '降序' }
            ]"
            placeholder="类型"
            default-value="asc"
            size="small"
            style="width: 35%;"
          />
          <a-input
            v-model="editNode.sort.key"
            @blur="() => editNode.sort.key = (editNode.sort.key || '').trim()"
            placeholder="排序字段"
            style="width: 65%; text-align: right;"
          />
        </a-input-group>
        <a-switch
          checked-children="后排序"
          un-checked-children="先排序"
          v-model="editNode.sort.afterFormat"
        />
        <a-input-group compact size="small" style="width: 75px; margin-left: 20px; display: inline-block;">
          <a-input
            v-model="editNode.dup.key"
            :disabled="!editNode.dup.status"
            :placeholder="editNode.dup.status ? '去重Key' : '不去重'"
            @blur="() => editNode.dup.key = (editNode.dup.key || '').trim()"
            style="text-align: right;"
          />
        </a-input-group>
        <a-switch
          checked-children="开"
          un-checked-children="关"
          v-model="editNode.dup.status"
          @change="val => !val && (editNode.dup.key = '')"
        />
        <a-input-group style="width: calc(100% - 420px); text-align: right; float: right;">
          <a-input-number
            style="width: 30%;"
            size="small"
            :formatter="val => `起始位置:  ${val || 0}`"
            :min="0"
            v-model="editNode.startIndex"
          />
          <a-input-number
            style="margin-left: 2px; width: 30%;"
            size="small"
            :formatter="val => `尺寸:  ${val || 0}`"
            :min="0"
            v-model="editNode.size"
          />
          <a-input-number
            style="margin-left: calc(5% - 1px); width: 30%;"
            size="small"
            :formatter="val => `序号:  ${val || 0}`"
            :min="0"
            v-model="editNode.order"
          />
        </a-input-group>
      </a-col>
      <a-col :span="1" class="right height-24">
        <common-tip title="当输出节点由多个数据源数据字段组成，该序号用于排序不同的数据源" />
      </a-col>
    </a-row>
  </a-card-meta>
</template>

<script>
import CommonTip from '../common/tip'
import Required from '../block/required'
import QueryPopover from '../block/queryPopover'
export default {
  name: 'mappingOut',
  components: {
    CommonTip,
    Required,
    QueryPopover
  },
  props: {
    editNode: {
      type: Object,
      default: () => {}
    },
    apiData: {
      type: Object,
      default: () => {}
    }
  }
}
</script>