export function sortBy(arr, prop, order) {
  return arr.sort((a, b) => {
    let left = a[prop], right = b[prop]
    if (left === undefined || left === null) {
      return order == 'desc' ? 1 : -1
    }
    if (right == undefined || right === null) {
      return order == 'desc' ? -1 : 1
    }
    if (left > right) return order == 'desc' ? -1 : 1
    if (left < right) return order == 'desc' ? 1 : -1
  })
}

export function copyItem(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function jsonFormat(json = {}) {
  let jsonString = JSON.stringify(json)
  let [msg, pos, prevChar, outOfQuotes] = ['', 0, '', true]
  // 循环每一个字符
  for (let i = 0; i < jsonString.length; i++) {
    let char = jsonString.substring(i, i + 1)
    if (char == '"' && prevChar != '\\') {
      outOfQuotes = !outOfQuotes
    } else if ((char == '}' || char == ']') && outOfQuotes) {
      msg += "\n"
      pos --
      for (let j = 0; j < pos; j++) {
        msg += '    '
      }
    }
    msg += char
    if ((char == ',' || char == '{' || char == '[') && outOfQuotes) {
      msg += "\n"
      if (char == '{' || char == '[') {
        pos ++
      }
      for (let k = 0; k < pos; k++) {
        msg += '    '
      }
    }
    prevChar = char
  }
  return msg.replace(/(\[(\s|\n)+\])|(\{(\s|\n)+\})/g, '[]')
}

export function addItem(arr, initItem = {}, noLimit = false) {
  if (noLimit || arr.length === 0 || arr[arr.length - 1]._id) {
    arr.push(initItem)
  } else {
    this.$message.warning('请完成前述空项的填写！')
  }
}

export function deleteItem(arr, index) {
  arr.splice(index, 1)
}

export function obj2Tree(data, title, nodeKey = '', isIndex = false) {
  if (data || [0, false, null, ''].includes(data)) {
    const key = (isIndex ? `${nodeKey}[${title}]` : (nodeKey ? `${nodeKey}.${title}` : title))
    if (Array.isArray(data)) {
      return {
        key,
        title: data.length ? title : title + ': []',
        children: data.map((item, index) => obj2Tree(item, `${index}`, key, true)).filter(item => item)
      }
    } else if (typeof data === 'object' && data) {
      return {
        key,
        title,
        children: Object.keys(data).map(k => obj2Tree(data[k], k, key)).filter(item => item)
      }
    } else {
      return { key, title: `${title}: ${data}` }
    }
  }
}

function handlePostFormater(formater) {
  return (formater || []).map(item => {
    let { children = [], mapping = [], type, key, order, sort, dup, a2o, size, startIndex } = item
    mapping.map(mapItem => {
      if (mapItem.operation === 'SPLIT' && mapItem.splitKey) {
        mapItem.operation = `SPLIT(${mapItem.splitKey})`
      }
      if (mapItem.operation === 'ELLIPSIS' && mapItem.splitKey) {
        mapItem.operation = `ELLIPSIS(${mapItem.splitKey})`
      }
      if (mapItem.operation === 'TIMESTAMP') {
        mapItem.operation = 'T2V'
        mapItem.value = 'NOW'
        mapItem.type = 'VALUE'
      }
      delete mapItem.splitKey
      if (mapItem.type !== 'KV2V') {
        mapItem.kv2v = {}
      }
      if (mapItem.operation !== 'LINK') {
        mapItem.link = {}
      }
      if (mapItem.type !== 'EVAL') {
        mapItem.eval = ''
      }
    });
    let [typeArray, typeParent, typeA2O] = [
      ['Parent-A', 'Array'].includes(type),
      ['Parent-A', 'Parent-O', 'Parent-A2O', 'Parent-X2O'].includes(type),
      ['A2O', 'Parent-A2O'].includes(type),
    ]
    if (type === 'Parent-A') {
      type = 'Array'
    } else if (type === 'Parent-O') {
      type = 'Object'
    } else if (type === 'Parent-A2O') {
      type = 'A2O'
    } else if (type === 'Parent-X2O') {
      type = 'X2O'
    }
    return {
      type,
      key,
      mapping,
      order: typeArray ? order : 0,
      startIndex: typeArray ? startIndex : 0,
      size: typeArray ? size : 0,
      sort: typeArray ? sort : {},
      dup: typeArray ? dup : {},
      a2o: typeA2O ? a2o : {},
      children: typeParent ? handlePostFormater(children) : []
    }
  })
}

function handlePostParams(params) {
  return (params || []).map(param => {
    const { required, type, _id, value, isFormat, from, inherit, multiKey, splitKey, chunkSize } = param
    const result = { required, type, _id, value, splitKey, multiKey, chunkSize }
    if (type === 'INHERIT') {
      if (inherit === 'multi') {
        result.multiKey = multiKey
      }
      result.from = isFormat ? (from + '_FORMATER') : from
    }
    return result
  })
}

export function handlePostBlock(form, editor = 'dev', isPreview = false) {
  const { _id, name, isOnline, gray, chunk, list, cache } = form
  const data = { name, isOnline, gray, chunk, cache, list: copyItem(list), editor }
  data.list.map(item => {
    item.api = item.api.map((api, index) => {
      const { base, required, level, _id, hasQipu, qipuIdConst, qipuSize, qipuIdKey, qipuDataKey, headers, params, body, formater } = api
      const result = {
        level,
        base: base ? base._id : _id,
        required: required || [],
        qipuIdConst: hasQipu && qipuIdConst,
        qipuSize: hasQipu && qipuSize || 0,
        qipuIdKey: hasQipu ? qipuIdKey : '',
        qipuDataKey: hasQipu ? qipuDataKey : '',
        headers: handlePostParams(headers),
        params: handlePostParams(params),
        body: handlePostParams(body),
        formater: handlePostFormater(formater)
      }
      if (isPreview) {
        result._id = index
      }
      return result
    })
    item.formater = handlePostFormater(item.formater)
  })
  return data
}