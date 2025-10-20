// src/axios.js
import axios from 'axios'

const instance = axios.create({
  //baseURL: 'http://jakaja.site', 
  baseURL: 'http://localhost/jakaja/public',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Keep true if using sessions/cookies
})

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // You can modify requests here (e.g., add auth token)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error statuses
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    if (error.response?.status === 404) {
      // Handle not found
    }
    return Promise.reject(error)
  },
)

export default instance
