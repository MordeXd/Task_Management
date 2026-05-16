import axios from 'axios'
import { store } from '../store'
import { logout } from '../features/authSlice'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Try to refresh token
        const response = await axios.post('http://127.0.0.1:5000/api/auth/refresh', {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        })

        const { access_token } = response.data
        localStorage.setItem('token', access_token)

        processQueue(null, access_token)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false

        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api