import axios from 'axios'
import { useUserStore } from '../store/user'
import router from '../router'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token失效，清除用户信息并跳转到登录页
          const userStore = useUserStore()
          userStore.clearUserInfo()
          router.push('/login')
          break
        default:
          console.error('响应错误:', error.response.data)
      }
    }
    return Promise.reject(error)
  }
)

export default service