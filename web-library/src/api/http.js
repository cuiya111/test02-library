import axios from 'axios'

// axios 实例：统一 baseURL 和超时
const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 响应拦截器：拆出 data；非 200 或网络错误统一转 Error
http.interceptors.response.use(
  (res) => {
    const d = res.data
    if (d.code !== 200) return Promise.reject(new Error(d.msg || '请求失败'))
    return d.data
  },
  (err) => {
    const msg = err.response?.data?.msg || err.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export default http
