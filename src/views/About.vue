<template>
  <a-tabs default-active-key="1">
    <a-tab-pane key="1" tab="关于我们">
      <a-divider orientation="left">
        <a-icon type="github" />
        <span style="margin: 0 5px;">GitHub -</span>
        <a href="https://github.com/JYQ2J/GMS">GMS</a>
      </a-divider>
      <a-carousel autoplay dot-position="right" effect="fade" style="border-radius: 5px;">
        <h1>以数据为核心的前后端数据融合解决方案</h1>
        <h1>以数据为驱动的前后端数据运营中心</h1>
        <h1>以数据为基础的前后端数据可视化配置能力</h1>
      </a-carousel>
    </a-tab-pane>
    <a-tab-pane key="2" tab="解决方案">
      <a-divider orientation="left" style="margin-bottom: 35px;">
        <a-icon type="github" />
        <span style="margin: 0 5px;">GitHub -</span>
        <a href="https://github.com/JYQ2J/GMC">GMC</a>
      </a-divider>
      <a-divider orientation="left">变量定义</a-divider>
      <a-list :data-source="solution.variable" :grid="{ gutter: 16, column: 3 }">
        <a-list-item slot="renderItem" slot-scope="item" style="margin-top: 8px;">
          <a-list-item-meta :title="item.name" :description="item.desc">
            <a-avatar slot="avatar" :style="{ backgroundColor: color[item.type] }">
              {{ item.type }}
            </a-avatar>
          </a-list-item-meta>
        </a-list-item>
      </a-list>
      <a-divider orientation="left">方案说明</a-divider>
      <a-steps v-model="solution.step" direction="vertical">
        <a-step title="通过 HTTP API / MongoDB 获取模块 JSON 配置，详见接入方式">
          <a-row slot="description" :gutter="[20]">
            <a-divider orientation="left" dashed>原型 Schema</a-divider>
            <a-col :span="8">
              <a-textarea :value="solution.schema.interface" class="code-area" auto-size disabled />
              <a-textarea :value="solution.schema.block" class="code-area" auto-size disabled />
            </a-col>
            <a-col :span="16">
              <a-textarea :value="solution.schema.interfaceParam" class="code-area" auto-size disabled />
              <a-textarea :value="solution.schema.blockParam" class="code-area" style="margin-top: 66px;" auto-size disabled />
              <a-textarea :value="solution.schema.blockFormater" class="code-area" auto-size disabled />
              <a-textarea :value="solution.schema.blockRequired" class="code-area" auto-size disabled />
            </a-col>
          </a-row>
        </a-step>
        <a-step title="获取模块对应的灰度配置">
          <a-row slot="description">
            <a-table
              row-key="type"
              size="small"
              style="margin-top: 12px;"
              :pagination="false"
              :columns="[
                {
                  title: '灰度类型',
                  dataIndex: 'type'
                },
                {
                  title: '说明',
                  dataIndex: 'desc'
                }
              ]"
              :data-source="[
                {
                  type: 'NONE',
                  desc: '全量'
                },
                {
                  type: 'INPUT',
                  desc: '根据输入参数进行灰度处理（如：版本）'
                },
                {
                  type: 'COOKIE',
                  desc: '根据客户端某个 Cookie 值进行灰度处理'
                },
                {
                  type: 'ABTEST',
                  desc: '天秤ABTEST灰度平台'
                }
              ]"
            />
            <a-divider orientation="left" dashed>逻辑实现</a-divider>
            <a-textarea :value="solution.logic.GetGrayItem" class="code-area" auto-size disabled />
          </a-row>
        </a-step>
        <a-step title="获取接口调用链">
          <a-row slot="description">
            <a-divider orientation="left" dashed>逻辑简述</a-divider>
            <p><b>输出：</b>ApiTree - 二维数组</p>
            <p><b>简述：</b>将参数列表中包含继承类型的接口归为继承接口，所有非继承接口全部加至一级调用，继承接口加至已调用的父级数组的次级调用，每次划分为 已调用数组 和 未调用数组，进行递归操作；</p>
            <a-divider orientation="left" dashed>逻辑实现</a-divider>
            <a-textarea :value="solution.logic.GetApiTree" class="code-area" auto-size disabled />
            <a-textarea :value="solution.logic.InheritTree" class="code-area" auto-size disabled />
          </a-row>
        </a-step>
        <a-step title="根据接口调用链获取每层级的接口数据，层级间串行获取，层级内并行获取">
          <a-row slot="description">
            <a-divider orientation="left" dashed>逻辑实现</a-divider>
            <a-textarea :value="solution.logic.GetFormatData" class="code-area" auto-size disabled />
            <a-divider orientation="right" dashed>字段节点映射方法</a-divider>
            <a-textarea :value="solution.logic.GetKey" class="code-area" auto-size disabled />
            <a-divider orientation="right" dashed>获取数据源接口请求参数（URL Params, Post Data, Headers）</a-divider>
            <a-table
              row-key="type"
              size="small"
              :pagination="false"
              :columns="[
                {
                  title: '参数类型',
                  dataIndex: 'type'
                },
                {
                  title: '说明',
                  dataIndex: 'desc'
                }
              ]"
              :data-source="[
                {
                  type: 'KV',
                  desc: '键值对'
                },
                {
                  type: 'INPUT',
                  desc: '请求模块数据时携带的输入参数'
                },
                {
                  type: 'COOKIE',
                  desc: '客户端Cookie值'
                },
                {
                  type: 'IP',
                  desc: '客户端IP地址'
                },
                {
                  type: 'UA',
                  desc: '客户端UA标识'
                },
                {
                  type: 'REFER',
                  desc: '页面REFER值'
                },
                {
                  type: 'REQID',
                  desc: '标识当前请求的唯一ID'
                },
                {
                  type: 'TIMESTAMP',
                  desc: '时间戳'
                },
                {
                  type: 'SIGN',
                  desc: '签名, 具体签名规则由各业务方实现'
                },
                {
                  type: 'INHERIT',
                  desc: '继承上级数据源数据的参数'
                }
              ]"
            />
            <a-textarea :value="solution.logic.GetApiParams" class="code-area mt-10" auto-size disabled />
            <a-divider orientation="right" dashed>
              根据数据源配置获取数据源数据，根据接口级缓存配置写入缓存，根据基础数据配置获取对应基础数据
            </a-divider>
            <a-textarea :value="solution.logic.GetInitData" class="code-area" auto-size disabled />
            <a-divider orientation="right" dashed>数据源数据映射 & 计算处理</a-divider>
            <a-col :span="11">
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.type',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: 'String',
                    desc: '字符串'
                  },
                  {
                    type: 'Number',
                    desc: '数字'
                  },
                  {
                    type: 'Boolean',
                    desc: '布尔值'
                  },
                  {
                    type: 'Object',
                    desc: '对象'
                  },
                  {
                    type: 'Array',
                    desc: '数组'
                  },
                  {
                    type: 'A2O',
                    desc: '键值对型数组->对象'
                  },
                  {
                    type: 'X2O',
                    desc: '自定义聚合对象'
                  }
                ]"
              />
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.mapping.type',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: 'KEY',
                    desc: '输入数据源数据节点'
                  },
                  {
                    type: 'VALUE',
                    desc: '输入常量'
                  },
                  {
                    type: 'INDEX',
                    desc: '输入数组元素对应Index'
                  },
                  {
                    type: 'KV2V',
                    desc: 'KV数组的指定键值'
                  },
                  {
                    type: 'RULE',
                    desc: '输入计算规则'
                  },
                  {
                    type: 'INPUT',
                    desc: '输入参数'
                  },
                  {
                    type: 'QS',
                    desc: '继承融合参数'
                  }
                ]"
              />
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.mapping.required.type',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: 'MUST',
                    desc: '必要条件'
                  },
                  {
                    type: 'SHOULD',
                    desc: '充分条件'
                  }
                ]"
              />
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.mapping.required.variable.field',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: 'LOCAL',
                    desc: '父级映射域'
                  },
                  {
                    type: 'GLOBAL',
                    desc: '全局映射域'
                  }
                ]"
              />
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.sort.order',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: 'asc',
                    desc: '升序排序'
                  },
                  {
                    type: 'desc',
                    desc: '降序排序'
                  }
                ]"
              />
            </a-col>
            <a-col :span="12" :offset="1">
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.mapping.operation',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: '空字符串',
                    desc: '或'
                  },
                  {
                    type: '+',
                    desc: '加'
                  },
                  {
                    type: '-',
                    desc: '减'
                  },
                  {
                    type: '*',
                    desc: '乘'
                  },
                  {
                    type: '/',
                    desc: '除'
                  }
                ]"
              />
              <a-table
                row-key="type"
                size="small"
                style="margin: 12px 0;"
                :pagination="false"
                :columns="[
                  {
                    title: 'Formater.mapping.required.variable.operation',
                    dataIndex: 'type',
                    width: 65
                  },
                  {
                    title: '说明',
                    dataIndex: 'desc',
                    width: 35
                  }
                ]"
                :data-source="[
                  {
                    type: '!!',
                    desc: '存在（非空值）'
                  },
                  {
                    type: '!',
                    desc: '非'
                  },
                  {
                    type: '==',
                    desc: '等于'
                  },
                  {
                    type: '!=',
                    desc: '不等于'
                  },
                  {
                    type: '>',
                    desc: '大于'
                  },
                  {
                    type: '>=',
                    desc: '大于等于'
                  },
                  {
                    type: '<',
                    desc: '小于'
                  },
                  {
                    type: '<=',
                    desc: '小于等于'
                  },
                  {
                    type: '+',
                    desc: '加'
                  },
                  {
                    type: '-',
                    desc: '减'
                  },
                  {
                    type: '*',
                    desc: '乘'
                  },
                  {
                    type: '/',
                    desc: '除'
                  },
                  {
                    type: 'REGEX',
                    desc: '正则匹配'
                  },
                  {
                    type: 'FIND',
                    desc: '数组过滤'
                  },
                  {
                    type: 'WEEK',
                    desc: '时间戳转换星期'
                  },
                  {
                    type: 'MONTH',
                    desc: '时间戳转换月份'
                  },
                  {
                    type: 'YEAR',
                    desc: '时间戳转换年份'
                  }
                ]"
              />
            </a-col>
            <a-textarea :value="solution.logic.MapFormatData" class="code-area" auto-size disabled />
            <a-textarea :value="solution.logic.MappingData" class="code-area" auto-size disabled />
            <a-textarea :value="solution.logic.RequiredValidation" class="code-area" auto-size disabled />
          </a-row>
        </a-step>
      </a-steps>
    </a-tab-pane>
    <a-tab-pane key="3" tab="更新日志" class="pd-20">
      <a-timeline>
        <a-timeline-item><span style="margin: 0 15px 0 5px;">......</span></a-timeline-item>
        <a-timeline-item v-for="(item, index) in timeline" :key="index" color="green">
          <a-icon
            slot="dot"
            :type="item.icon || 'clock-circle-o'"
            :theme="getIconProp(item.icon, 'theme')"
            :style="getIconProp(item.icon, 'style')"
          />
          <div style="font-size: 16px; margin-bottom: 5px;">
            <span style="margin: 0 15px 0 5px;">{{ item.time }}</span>
            <span v-html="`V${item.v}`"></span>
          </div>
          <div style="font-size: 14px; color: #888;" v-html="item.log"></div>
        </a-timeline-item>
      </a-timeline>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import {
  SchemaInterfaceParam,
  SchemaInterface,
  SchemaBlockParam,
  SchemaBlockRequired,
  SchemaBlockFormater,
  SchemaBlock
} from '../utils/schema'
import {
  GetGrayItem,
  GetApiTree,
  InheritTree,
  GetFormatData,
  GetApiParams,
  GetInitData,
  MapFormatData,
  MappingData,
  RequiredValidation,
  GetKey
} from '../utils/codeLogic'
import { updateLog } from '../utils/updateLog'

export default {
  data() {
    return {
      solution: {
        step: 0,
        variable: [
          {
            type: '对象',
            name: 'Config',
            desc: '模块配置信息JSON对象'
          },
          {
            type: '对象',
            name: 'GrayItem',
            desc: '命中的灰度配置信息'
          },
          {
            type: '数组',
            name: 'ApiTree',
            desc: '二维数组 - 模块数据源接口调用链'
          },
          {
            type: '对象',
            name: 'InitData',
            desc: '数据源原始数据'
          },
          {
            type: '对象',
            name: 'FormatData',
            desc: '输出的映射数据'
          }
        ],
        schema: {
          interface: SchemaInterface,
          interfaceParam: SchemaInterfaceParam,
          block: SchemaBlock,
          blockParam: SchemaBlockParam,
          blockFormater: SchemaBlockFormater,
          blockRequired: SchemaBlockRequired
        },
        logic: {
          GetGrayItem,
          GetApiTree,
          InheritTree,
          GetFormatData,
          GetKey,
          GetApiParams,
          GetInitData,
          MapFormatData,
          MappingData,
          RequiredValidation
        }
      },
      timeline: updateLog,
      iconStyle: {
        'heart': {
          style: 'color: red;',
          theme: 'filled'
        }
      },
      color: {
        'ALL': '#f56a00',
        'PCW': '#7265e6',
        'PCA': '#ffbf00',
        'PHW': '#00a2ae',
        'GET': '#7265e6',
        'POST': '#ffbf00',
        '对象': '#7265e6',
        '数组': '#ffbf00',
      },
      step: 0,
      adminList: []
    }
  },
  methods: {
    getIconProp(icon, prop) {
      return (this.iconStyle[icon] || {})[prop]
    },
    stepChange(val) {
      this.step = val
    }
  },
}
</script>
<style scoped>
.code-area {
  color: #666;
  margin-bottom: 20px;
}
.ant-carousel >>> .slick-list {
  border-radius: 5px;
}
.ant-carousel >>> .slick-slide {
  text-align: center;
  height: calc(100vh - 321px);
  line-height: calc(100vh - 321px);
  background: #364d79;
  overflow: hidden;
}
.ant-carousel >>> .slick-slide h1 {
  font-size: 20px;
  color: #fff;
}
</style>
