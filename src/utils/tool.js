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