import { message } from 'ant-design-vue'
import axios from 'axios'

export async function http(url, opt = {}) {
  const { defaultData = {} } = opt
  const { status, data = {} } = (await axios(url, opt)) || {}
  if (status === 200 && data.code === 'A00000') {
    return data.data || defaultData
  } else if (data.code === 'A00005') {
    message.warn('抱歉，您的权限不足')
  } else {
    if (data.errMsg.includes('duplicate key')) {
      message.error('当前数据 ID 与 现有数据 ID 已重复，请修改 ID 再进行数据创建！')
    } else {
      message.error('请求失败，请重试！')
    }
  }
  return defaultData;
}