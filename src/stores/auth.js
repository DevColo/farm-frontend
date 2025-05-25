// src/store/auth.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('user_token') || null,
    loading: false,
    error: null,
  }),

  actions: {
    async login(email, password, router) {
      this.loading = true
      this.error = null
      const toast = useToast()

      try {
        const res = await axios.post('/login', { email, password })
        this.token = res.data.token
        this.user = res.data.user

        localStorage.setItem('user_token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        if (router) {
          //toast.success('Logged in successfully')
          router.push('/dashboard')
        }
      } catch (err) {
        //console.log('Login error response:', err.response?.data?.message)
        const message = err.response?.data?.message || 'Login failed'
        toast.error(message)
      } finally {
        this.loading = false
      }
    },

    logout(router) {
      const toast = useToast()
      this.token = null
      this.user = null
      localStorage.removeItem('user_token')
      localStorage.removeItem('user')

      if (router) {
        toast.success('Logged out successfully')
        router.push('/login')
      }
    },
  },
})
