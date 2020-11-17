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
        <a-list-item slot="renderItem" slot-scope="item, index" style="margin-top: 8px;">
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
                    type: 'RULE',
                    desc: '输入计算规则'
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
import { http } from '../utils/http'
import { sortBy } from '../utils/tool'

const GetGrayItem = `// 获取模块对应的灰度配置
Function GetGrayItem (Config.list, Config.gray) {
    if (Config.gray.type == 'INPUT') {
        // 获取 gray属性 与 输入参数[Config.gray._id] 一致的Config.list子元素
        for (item in Config.list) {
            if (item.gray == 输入参数[Config.gray._id]) {
                return item;
            }
        }
    } else if (Config.gray.type == 'COOKIE') {
        // 获取 gray属性 与 键值为Config.gray._id的Cookie尾号 一致的Config.list子元素
        for (item in Config.list) {
            if (item.gray == Cookie.get(Config.gray._id)的尾号) {
                return item;
            }
        }
    } else if (Config.gray.type == 'ABTEST') {
        // 天秤灰度数据列表
        Object AbList = GetAbData({ device_id, platform, layer_id, source });
        // 当前模块的天秤数据
        Object AbData;
        // 根据天秤param值获取当前模块的天秤数据
        for (AbItem in AbList.data.ab_result) {
            if (AbItem.param == Config.gray._id) {
                AbData = AbItem;
                break;
            }
        }
        // 获取 gray属性 与 天秤value值 一致的Config.list子元素
        for (item in Config.list) {
            if (item.gray == AbData.value) {
                item.abtest = AbData.abtest;
                return item;
            }
        }
    } else {
        return Config.list[0];
    }
}`
const GetApiTree = `// 获取接口调用链
Function GetApiTree (GrayItem.api) {
    // 定义已调用的接口数组
    Array Loaded;
    // 定义未调用的接口数组
    Array UnLoad;
    // 遍历所有数据源接口
    for (item in GrayItem.api) {
        if (item.params.every(p => (p.type != 'INHERIT'))) {
            // 所有非继承接口全部加至一级调用, 并加入已调用的接口数组
            ApiTree[0].add(item);
            Loaded.add(item);
        } else {
          // 其余继承接口加至未调用的接口数组
            UnLoad.add(item);
        }
    }
    // 将所有非继承接口全部加至一级调用
    ApiTree.add(Loaded);
    // 将所有继承接口加至对应调用级层
    InheritTree(ApiTree, UnLoad, Loaded);
}`
const InheritTree = `// 定义继承接口调用链获取函数
Function InheritTree (ApiTree, UnLoad, Loaded) {
    // 本次调用的接口数组
    Array CurrentLoaded;
    // 本次未调用的接口数组
    Array CurrentUnLoad;
    // 遍历所有未调用的接口数组
    for (item in UnLoad) {
        // 遍历接口参数中的所有继承参数（type == 'INHERIT'），如果Loaded[*].base._id包含所有继承参数的from属性（from属性需去除'_FORMATER'后缀），则把该接口加入本次调用，并加入已调用数组
        if (item.params.filter(p => (p.type == 'INHERIT')).every(p => (
            [Loaded.base._id].includes(p.from.replace(/_FORMATER$/, ''));
        ))) {
            CurrentLoaded.add(item);
            Loaded.add(item);
        } else {
            CurrentUnLoad.add(item);
        }
    }
    // 将本次调用的接口数组加入下一级接口调用链（二维数组）
    ApiTree.add(CurrentLoaded);
    // 如果本次未调用的接口数组不为空，则递归执行
    if (CurrentUnLoad.length > 0) {
        InheritTree(ApiTree, CurrentUnLoad, Loaded);
    }
}`
const GetFormatData = `// 根据接口调用链获取每层级的接口数据，层级间串行获取，层级内并行获取
Function GetFormatData (ApiTree, InitData, FormatData, GrayItem, Config.cache_time) {
    // 串行获取每个调用层级的接口
    Sequence For ((Array, Index) in ApiTree) {
        // 并行获取调用层级内的每个接口
        Concurrence For(Api in Array) {
            // 接口URL参数
            Object QS = GetApiParams(Api.base, Api.params, [全部接口列表], FormatData, InitData);
            // 接口Post Data
            Object FormData = GetApiParams(Api.base, Api.body, [全部接口列表], FormatData, InitData);
            // 接口Headers
            Object Headers = GetApiParams(Api.base, Api.headers);
            // 请求条件校验
            if (RequiredValidation(Api, { ...QS, ...FormData })) {
                // 获取数据源数据，根据接口级缓存配置写入缓存，根据基础数据配置获取对应基础数据
                GetInitData (InitData, Api, QS, FormData, Headers);
                // 数据源数据映射 & 计算处理
                MapFormatData(FormatData, Api.formater, {}, InitData, Api.qipuIdKey, Api.qipuDataKey);
            }
        }
    }
    // 根据模块级缓存配置写入缓存
    if (Config.cache_time > 0) {
        WriteCache(Data, GrayItem.gray, Config.cache_time);
    }
    return {
        base: {
            isOnline: Config.isOnline,
            chunk: Config.chunk,
            block: GrayItem.block,
            abtest: GrayItem.abtest
        },
        formatData: FormatData
    };
}`
const GetApiParams = `// 获取数据源接口请求参数（URL Params, Post Data, Headers）
Function GetApiParams (base, params, api, FormatData, InitData) {
    // 输出的参数列表
    Object Result;
    // 遍历参数配置列表
    for (param in params) {
        if (param.type == 'KV') {
            Result[param._id] = param.value;
        } else if (param.type == 'INPUT') {
            Result[param._id] = URL参数[param._id];
        } else if (param.type == 'COOKIE') {
            Result[param._id] = Cookie.get(param._id);
        } else if (param.type == 'IP') {
            Result[param._id] = 客户端IP;
        } else if (param.type == 'UA') {
            Result[param._id] = 客户端UA标识;
        } else if (param.type == 'REFER') {
            Result[param._id] = 客户端Refer;
        } else if (param.type == 'REQID') {
            Result[param._id] = 标识一次请求的唯一ID，随机生成;
        } else if (type === 'TIMESTAMP') {
            Result[param._id] = 当前时间戳;
        } else if (param.type == 'INHERIT' && InitData[param.from]) {
            RegExp R = /_FORMATER$/;
            // 如果param中的from属性值是以_FORMATER结尾的，则该继承参数来自于上级接口的映射计算结果，否则来自于上级接口的原始数据
            if (R.test(param.from)) {
                Result[param._id] = GetKey(FormatData, param.value);
            } else {
                // 获取该参数继承的父级接口，param中的from属性值（去除_FORMATER后缀）与接口base._id属性相同
                Object ParentApi = api.find(item => (
                    item.base._id == param.from.replace(R, '')
                ));
                // 传入父级接口的数组属性（multi属性）
                Result[param._id] = GetKey(InitData[param.from], param.value, ParentApi.base.multi);
            }
            if (param.splitKey) {
                // 分隔符拼接数组参数
                Result[param._id] = Result[param._id].join(param.splitKey);
            } else if (multiKey) {
                // 批量请求参数处理
                Result[param._id] = { out: multiKey, in: Result[param._id] };
            }
        }
    }
    const sign = params.find(param => param.type === 'SIGN');
    if (sign) {
        Result[sign._id] = 签名规则[sign.value](Result, base);
    }
    return Result;
}`
const GetInitData = `// 根据数据源配置获取数据源数据，根据接口级缓存配置写入缓存，根据基础数据配置获取对应基础数据
Function GetInitData (InitData, Api, QS, FormData, Headers) {
    // 获取是否包含批量参数
    String MultiKey;
    For (Key in QS) {
        if (QS[Key].in && QS[Key].out) {
            MultiKey = Key;
            break;
        }
    }
    // 获取数据源数据
    Object Data = {};
    if (MultiKey) {
        // 批量同源数据请求
        Data[QS[MultiKey].out] = [];
        For(Value in QS[MultiKey].in) {
            Object QSNew = { ...QS, [MultiKey]: Value };
            Object DataItem = HttpRequest(Api.base.method, Api.base.url, Api.base.timeout, QSNew, FormData, Headers);
            Data[QS[MultiKey].out].add(DataItem);
        }
    } else {
        // 默认数据请求
        Data = HttpRequest(Api.base.method, Api.base.url, Api.base.timeout, QS, FormData, Headers);
    }
    // 根据接口阻塞级别抛出异常，成功请求的数据记录于InitData，用于次级数据源继承参数取值
    if (HasError && Api.level == 'error') {
        throw ApiError;
    } else {
        InitData[Api.base._id] = Data;
    }
    // 根据接口级缓存配置写入缓存
    if (Api.base.cache.time > 0) {
        WriteCache(Data, Api.base.cache.key, Api.base.cache.time);
    }
    // 根据基础数据配置，获取基础数据
    if (Api.qipuIdKey && Api.qipuDataKey) {
        // 根据qipuIdKey获取实体ID数组，建议进行去重处理
        Array QipuIdArr = GetKey(Data, Api.qipuIdKey);
        // 获取实体ID数组对应的实体数据对象，建议输出以实体ID为键值的对象
        InitData[Api.qipuDataKey] = GetQipuData(QipuIdArr);
    }
}`
const MapFormatData = `// 数据源数据映射 & 计算处理
Function MapFormatData (FormatData, Formaters, Parent, InitData, QipuIdKey, QipuDataKey) {
    // 实体ID取值父级数据对象中键值为QipuIdKey末尾节点的属性，因此仅实体ID同级节点可获取实体数据
    Number QipuId = Parent[QipuIdKey的末尾节点];
    Object QipuData = QipuId ? InitData[qipuDataKey][QipuId] : {};
    // 定义返回值
    Object FormatItem;
    // 遍历映射器
    for (Formater in Formaters) {
        // 映射字段输出结果
        Object Result = MappingData(Formater, Parent, InitData, QipuData, QipuDataKey);
        // 数组->对象，如: [{ name: 'a', value: 1 }, { name: 'b', value: 2 }] => { a: 1, b: 2 }
        if (Formater.type == 'A2O' && Formater.a2o.key && Formater.a2o.value && IsArray(Result)) {
            if (Formater.a2o.value) {
                键值对数组->对象，如: [{ name: 'a', value: 1 }, { name: 'b', value: 2 }] => { a: 1, b: 2 }
                Result = A2O(Result, Formater.a2o.key, Formater.a2o.value);
            } else {
                对象数组->对象，如: [{ id: 'd1', name: 'a' }, { id: 'd2', name: 'b' }] => { d1: { id: 1, name: 'a' }, d2: { id: 2, name: 'b' } }
                Result = A2O(Result, Formater.a2o.key);
            }
        }
        // 子属性递归处理
        if (Formater.type == 'Array') {
            // 若Result映射结果不是数组，需将Result转化为一个元素的数组
            Result = IsArray(Result) ? Result : [Result];
            // 根据数组元素对象的某一属性排序数组
            if (Formater.sort.key) {
                Result = SortBy(Result, Formater.sort.key, Formater.sort.order);
            }
            // 根据配置的size裁剪数组尺寸
            if (Formater.size) {
                Result = Result.slice(0, Formater.size);
            }
            // 对象元素子级映射遍历
            if (Formater.children.length > 0) {
                for ((FormatItem, index) in Result) {
                    Result[index] = MapFormatData(FormatData, Formater.children, FormatItem, InitData, QipuIdKey, QipuDataKey);
                }
            }
            // 异源数据合并
            if (FormatData[Formater.key]) {
                // 若FormatData中已存在该键值属性，则根据第一个元素中的STRATEGY_ORDER属性与Formater.order进行比较，合并数组
                if (Formater.order > FormatData[Formater.key][0].STRATEGY_ORDER) {
                    Result = [...FormatData[Formater.key], ...Result];
                } else {
                    Result = [...Result, ...FormatData[Formater.key]];
                }
            } else {
                // 设定数组的次序
                Result[0].STRATEGY_ORDER = Formater.order;
            }
        } else if (Formater.children.length > 0) {
            if (Formater.type == 'A2O') {
                // A2O元素子级节点映射
                for (Key in (Result || {})) {
                    if (typeof Result[Key] === 'Object') {
                        // A2O子属性类型为对象时，映射子级节点
                        Result[Key] = MapFormatData(FormatData, Formater.children, Result[Key], InitData, QipuIdKey, QipuDataKey);
                    } else if (typeof Result[Key] === 'Array') {
                        // A2O子属性类型为数组时，映射子元素的子级节点
                        for ((Item, index) in Result[Key]) {
                            Result[Key][index] = MapFormatData(FormatData, Formater.children, Item, InitData, QipuIdKey, QipuDataKey);
                        }
                    }
                }
            } else {
                // 对象元素子级节点映射
                Result = MapFormatData(FormatData, Formater.children, FormatItem, InitData, QipuIdKey, QipuDataKey);
            }
        }
        // 如果Parent就是InitData（首层映射），则映射结果直接回填FormatData，否则回填本次映射对象
        if (Parent == InitData) {
            FormatData[Formater.key] = Result;
        } else {
            FormatItem[Formater.key] = Result;
        }
    }
    return FormatItem;
}`
const MappingData = `// 映射字段输出结果
Function MappingData (Formater, Parent, InitData, QipuData, QipuDataKey) {
    // 定义字段输出结果
    Object Result;
    // 遍历映射数组
    for ((Mapping, index) in Formater.mapping) {
        // 定义约束条件有效性
        Boolean IsValid = RequiredValidation(Mapping, Parent, InitData, QipuData, QipuDataKey);
        // 数据有效/数组过滤 => 执行映射，否则，返回Undefined
        if (IsValid) {
            if (Mapping.type == 'RULE') {
                Mapping.value = (进行 Mapping.value 形式的特定规则处理，如：QipuData 进行 角标处理);
            } else if (Mapping.type == 'KEY') {
                // 如果Mapping.value的首级节点为QipuDataKey，则映射数据源为基础数据，否则为父级数据源
                if (Mapping.value.startsWith(QipuDataKey + '.')) {
                    Mapping.value = GetKey(QipuData, Mapping.value.replace(QipuDataKey + '.', ''));
                } else {
                    Mapping.value = GetKey(Parent, Mapping.value);
                }
            }
            // 数组过滤（输出数组/对象）
            if (IsValid == 'FIND' && IsArray(Mapping.value)) {
                for (Item in Mapping.value) {
                    // 定义数组过滤条件
                    String Condition = '';
                    for (Variable in Mapping.required[0].variable) {
                        if (Variable.operation != 'FIND') {
                            Condition += Variable.operation;
                        }
                        if (Variable.type == 'KEY') {
                            Condition += Item[Variable.value];
                        } else {
                            Condition += Variable.value;
                        }
                    }
                    // 符合过滤条件的元素添加至Result
                    if (eval(Condition)) {
                        if (Formater.type == 'Array') {
                            Result.add(Item);
                        } else {
                            Result = Item;
                            break;
                        }
                    }
                }
            }
            if (index > 0 && Mapping.operation) {
                Result = (Result 与 Mapping.value 进行 Mapping.operation 加/减/乘/除运算);
            } else {
                Result = Mapping.value;
            }
            if (Formater.mapping[index + 1] && !Formater.mapping[index + 1].operation && Result) {
                return Result;
            }
        }
    }
    return Result;
}`
const RequiredValidation = `// 验证约束条件有效性
Function RequiredValidation (Mapping, Parent, InitData, QipuData, QipuDataKey) {
    // 定义约束条件有效性结果
    Boolean IsValid = (Mapping.required.length == 0);
    // 遍历约束条件配置
    for (Required in Mapping.required) {
        // 定义单个约束条件有效性布尔值
        Boolean RequiredValue;
        // 遍历单个约束条件内的多个变量
        for ((Variable, VIndex) in Required.variable) {
            if (Variable.operation === 'FIND') {
                return Variable.operation;
            }
            if (Variable.type == 'KEY') {
                if (Variable.value.startsWith(QipuDataKey + '.')) {
                    // 如果Variable.value的首级节点为QipuDataKey，则映射数据源为基础数据
                    Variable.value = GetKey(QipuData, Variable.value.replace(QipuDataKey + '.', ''));
                } else if (Variable.field == 'GLOBAL') {
                    // 如果Variable.field为GLOBAL，则映射数据源为原始数据源
                    Variable.value = GetKey(InitData, Variable.value);
                } else {
                    // 如果Variable.field为LOCAL，则映射数据源为父级数据源
                    Variable.value = GetKey(Parent, Variable.value);
                }
            }
            if (VIndex == 0) {
                RequiredValue = Variable.value;
                if (Required.variable[1]) {
                    continue;
                }
            }
            if (operation === 'WEEK') {
                RequiredValue = (RequiredValue对应的时间戳值 是否为 星期[Variable.value]);
                break;
            } else if (operation === 'MONTH') {
                RequiredValue = (RequiredValue对应的时间戳值 是否为 月份[Variable.value]);
                break;
            } else if (operation === 'YEAR') {
                RequiredValue = (RequiredValue对应的时间戳值 是否为 年份[Variable.value]);
                break;
            } else if (Variable.operation == 'REGEX') {
                RequiredValue = (RequiredValue 是否匹配 Variable.value对应的正则规则，得出布尔值结果);
                break;
            } else if (['!!', '!', '==', '!=', '>', '>=', '<', '<='].indexOf(Variable.operation) >= 0) {
                RequiredValue = (RequiredValue 与 Variable.value 进行 Variable.operation 比较计算，得出布尔值结果);
                break;
            } else {
                RequiredValue = (RequiredValue 与 Variable.value 进行 Variable.operation 加/减/乘/除运算);
            }
        }
        // 单个约束条件有效性布尔值 赋值 约束条件有效性
        IsValid = RequiredValue;
        // 充要条件判定
        if (Required.type == 'SHOULD' && IsValid) {
            break;
        } else if (!IsValid) {
            break;
        }
    }
    return IsValid;
}`
const GetKey = `// 字段节点映射方法
Function GetKey (Data, Key) {
    if (Key.contains("[*]")) {
        return GetMultiKey(Data, Key.split('[*].'), []);
    } else {
        return GetSingleKey(Data, Key);
    }
}

// 基础映射规则
Function GetSingleKey(Data, Key) {
    return 以下两种映射情况：
    (1) 对象obj的子级对象base的子级属性id: obj.base.id;
    (2) 数组list第1个元素的子级对象base的子级属性id: list[0].base.id;
}

// 多维数组扁平化映射规则
Function GetMultiKey(Data, KeyArr, Result = []) {
    String Left = KeyArr[0];
    Array Right = KeyArr.slice(1);
    for (DataItem in GetSingleKey(Data, Left)) {
        if (Right.length > 1) {
            GetMultiKey(DataItem, Right, Result);
        } else {
            Result.add(GetSingleKey(DataItem, Right[0]))
        }
    }
    return Result;
}
`

const SchemaInterfaceParam = `// 数据源请求参数原型
Schema InterfaceParam = {
    // 参数类型: KV / COOKIE / IP / INHERIT / UA / REFER / REQID / TIMESTAMP / SIGN
    type: { type: String, default: 'KV' },
    // 参数字段名
    _id: String,
    // 参数默认值
    default: String
}`
const SchemaInterface = `// 数据源原型
Schema Interface = {
    // 数据源ID
    _id: String,
    // 数据源名称
    name: String,
    // 数据源分组
    group: String,
    // 数据源地址
    url: String,
    // 请求超时时间
    timeout: { type: Number, default: 3000 },
    // 请求方法
    method: { type: String, default: 'GET' },
    // 缓存配置
    cache: { key: Array, time: Number },
    // 请求头
    headers: [InterfaceParam],
    // URL参数
    params: [InterfaceParam],
    // POST参数
    body: [InterfaceParam],
    // 实体ID输入节点
    qipuIdKey: String,
    // 实体数据输出节点
    qipuDataKey: String,
    // 创建时间
    create_time: { type: Date, default: Date.now },
    // 更新时间
    update_time: { type: Date, default: Date.now },
    // 编辑者
    editor: String
}`
const SchemaBlockParam = `// 模块请求参数原型
Schema BlockParam = {
    // 参数类型: KV / COOKIE / IP / INHERIT / UA / REFER / REQID / TIMESTAMP / SIGN
    type: { type: String, default: 'KV' },
    // 参数字段名
    _id: String,
    // 参数取值
    value: String,
    // INHERIT类型 - 参数取值来源
    from: String,
    // INHERIT类型 - 批量参数分隔符
    splitKey: String,
    // INHERIT类型 - 批量请求输出
    multiKey: String,
    // INHERIT类型 - 分批批量尺寸
    chunkSize: { type: Number, default: 1 }
}`
const SchemaBlockRequired = `// 校验条件原型
Schema BlockRequired = {
    // 子条件关系: MUST / SHOULD
    type: { type: String, default: 'MUST' },
    // 三元运算变量
    variable: [{
        // 映射域: GLOBAL / LOCAL
        field: { type: String, default: 'LOCAL' },
        /// 输入的映射类型: KEY / VALUE
        type: { type: String, default: 'KEY' },
        // 输入的具体变量值
        value: { type: Schema.Types.Mixed, default: null },
        // 运算符类型: !! / ! / == / != / > / >= / < / <= / + / - / * / / / REGEX / FIND / WEEK / MONTH / YEAR
        operation: String
    }]
}`
const SchemaBlockFormater = `// 模块映射原型
Schema BlockFormater = {
    // 数据类型: String / Number / Boolean / Array / Object / A2O
    type: { type: String, default: 'String' },
    // 输出字段
    key: String,
    // 多个可选映射的字段节点
    mapping: [{
        // 输入的映射类型: KEY / VALUE / RULE
        type: { type: String, default: 'KEY' },
        // 输入的映射值
        value: Schema.Types.Mixed,
        // 输出条件
        required: [BlockRequired],
        // 运算符类型: + / - / * / /
        operation: String
        // KV数组输出单个Value
        kv2v: {
          // KV数组元素键
          key: String,
          // 输出的KV元素的键
          keyName: String,
          // KV数组元素值
          value: String
        }
    }],
    // 多个拼接数据的顺序索引
    order: { type: Number, default: 0 },
    // 数组排序
    sort: {
        // 升序 asc, 降序 desc
        order: String,
        // 排序字段
        key: String
    },
    // 数组起始Index
    startIndex: { type: Number, default: 0 },
    // 所需数组长度
    size: Number,
    // 数组转对象
    a2o: { key: String, value: String },
    // 子结构
    children: [Formater]
}`
const SchemaBlock = `// 模块原型
Schema Block = {
    // Block ID
    _id: String,
    // 名称
    name: String,
    // 组别
    group: String,
    // 是否上线
    isOnline: { type: Boolean, default: true },
    // 灰度类型
    gray: {
        // 灰度类型: NONE / COOKIE / INPUT / ABTEST
        type: { type: String, default: 'NONE' },
        // 灰度取值
        _id: String
    },
    // 灰度列表
    list: [{
        // 统计值 - block
        _id: String,
        // 灰度值
        gray: String
        // 接口列表
        api: [{
            // 接口ID
            base: Interface,
            // 接口请求条件
            required: [BlockRequired],
            // 接口阻塞级别: error / warn
            level: { type: String, default: 'error' },
            // 接口URL参数
            params: [BlockParam],
            // 接口POST参数
            body: [BlockParam],
            // 接口请求头
            headers: [BlockParam],
            // 输出规则
            formater: [BlockFormater],
            // 实体ID输入节点
            qipuIdKey: String,
            // 实体数据输出节点
            qipuDataKey: String,
        }],
    }],
    // 数据切割 [2, 8]
    chunk: [{ key: String, value: Number }],
    // 缓存配置
    cache: {
      key: { type: Array, default: [] },
      time: { type: Number, default: 0 }
    },
    // 创建时间
    create_time: { type: Date, default: Date.now },
    // 更新时间
    update_time: { type: Date, default: Date.now },
    // 编辑者
    editor: String
}`

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
      timeline: [
        {
          time: '2020-10-19',
          v: '1.7',
          log: `
            <div>- 新增支持数据源请求条件校验；</div>
            <div>- 新增支持数组扁平化输出；</div>
            <div>- 新增支持KV数组单值（KV2V）输入类型；</div>
            <div>- 新增支持按多个输入类型参数进行模块级缓存；</div>
            <div>- 新增支持展示预览数据源接口列表（请求地址&请求耗时）；</div>
            <div>- 新增Data类型模块，隐藏数据模块部分配置项；</div>
          `
        },
        {
          time: '2020-10-13',
          v: '1.6',
          log: `
            <div>- 新增支持模块内子级属性一键复制/粘贴；</div>
            <div>- 新增支持同数据源批量请求；</div>
            <div>- 新增支持星期/月份/年份计算规则；</div>
            <div>- 修复预览时继承参数因数据源id缺失获取失败问题；</div>
            <div>- 修复格式化继承参数重复转化问题；</div>
            <div>- 更新图标；</div>
          `
        },
        {
          time: '2020-10-09',
          v: '1.5',
          log: `
            <div>- 约束条件非必要时自动隐藏；</div>
            <div>- 模块ID强制规范，增加模块频道筛选；</div>
            <div>- 新增支持参数类型：签名，时间戳类型；</div>
            <div>- 优化多维数组映射方式；</div>
          `
        },
        {
          time: '2020-09-23',
          v: '1.4',
          log: `
            <div>- 修复一键导入及回滚相关BUG；</div>
            <div>- 新增支持KV数组转化为对象的计算规则；</div>
            <div>- 新增支持数组过滤器；</div>
          `
        },
        {
          time: '2020-09-21',
          v: '1.3',
          log: `
            <div>- 模块ID增加强制格式，支持配置扩展；</div>
            <div>- 模块ID增加线上调用地址跳转，方便开发同学使用；</div>
          `
        },
        {
          time: '2020-08-25',
          v: '1.2',
          log: `
            <div>- 支持接入自动化灰度系统（ABTEST）；</div>
            <div>- 支持多灰度预览；</div>
            <div>- 增加数据源/模块提示信息；</div>
          `,
          icon: 'heart'
        },
        {
          time: '2020-08-20',
          v: '1.1',
          log: `
            <div>- 增加一键复制功能；</div>
            <div>- 增加参数类型：INPUT, REQID, UA, REFER；</div>
            <div>- 增加正则类型计算规则；</div>
            <div>- 增加接口配置：超时时间，请求方式(GET/POST)，Headers，Post Body等；</div>
            <div>- 接口级/模块级缓存配置；</div>
            <div>- 模块内接口阻塞级别配置；</div>
            <div>- 更为严格的校验规则；</div>
          `
        },
        {
          time: '2020-08-08',
          v: '1.0 - 我们呱呱坠地，出生了！'
        }
      ],
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
