export const GetGrayItem = `// 获取模块对应的灰度配置
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

export const GetApiTree = `// 获取接口调用链
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

export const InheritTree = `// 定义继承接口调用链获取函数
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

export const GetFormatData = `// 根据接口调用链获取每层级的接口数据，层级间串行获取，层级内并行获取
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
                // 获取数据源数据，根据接口级缓存配置写入缓存，根据奇谱数据配置获取对应奇谱数据
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

export const GetApiParams = `// 获取数据源接口请求参数（URL Params, Post Data, Headers）
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

export const GetInitData = `// 根据数据源配置获取数据源数据，根据接口级缓存配置写入缓存，根据奇谱数据配置获取对应奇谱数据
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
    // 根据奇谱数据配置，获取奇谱数据
    if (Api.qipuIdKey && Api.qipuDataKey) {
        // 根据qipuIdKey获取奇谱ID数组，建议进行去重处理
        Array QipuIdArr = GetKey(Data, Api.qipuIdKey);
        // 获取奇谱ID数组对应的奇谱数据对象，建议输出以奇谱ID为键值的对象
        InitData[Api.qipuDataKey] = GetQipuData(QipuIdArr);
    }
}`

export const MapFormatData = `// 数据源数据映射 & 计算处理
Function MapFormatData (FormatData, Formaters, Parent, InitData, QipuIdKey, QipuDataKey) {
    // 奇谱ID取值父级数据对象中键值为QipuIdKey末尾节点的属性，因此仅奇谱ID同级节点可获取奇谱数据
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

export const MappingData = `// 映射字段输出结果
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
                // 如果Mapping.value的首级节点为QipuDataKey，则映射数据源为奇谱数据，否则为父级数据源
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

export const RequiredValidation = `// 验证约束条件有效性
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
                    // 如果Variable.value的首级节点为QipuDataKey，则映射数据源为奇谱数据
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

export const GetKey = `// 字段节点映射方法
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