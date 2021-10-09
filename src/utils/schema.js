export const SchemaInterfaceParam = `// 数据源请求参数原型
Schema InterfaceParam = {
    // 参数类型: KV / COOKIE / IP / INHERIT / UA / REFER / REQID / TIMESTAMP / SIGN
    type: { type: String, default: 'KV' },
    // 参数字段名
    _id: String,
    // 参数默认值
    default: String
}`
export const SchemaInterface = `// 数据源原型
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
    // 奇谱ID输入节点
    qipuIdKey: String,
    // 奇谱数据输出节点
    qipuDataKey: String,
    // 创建时间
    create_time: { type: Date, default: Date.now },
    // 更新时间
    update_time: { type: Date, default: Date.now },
    // 编辑者
    editor: String
}`
export const SchemaBlockParam = `// 模块请求参数原型
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
export const SchemaBlockRequired = `// 校验条件原型
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
export const SchemaBlockFormater = `// 模块映射原型
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
export const SchemaBlock = `// 模块原型
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
            // 奇谱ID输入节点
            qipuIdKey: String,
            // 奇谱数据输出节点
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