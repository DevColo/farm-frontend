// src/store/auth.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: [], //fetchUser(JSON.parse(localStorage.getItem('user'))) || null,
    token: localStorage.getItem('user_token') || null,
    loading: false,
    error: null,
    users: [],
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
        this.fetchUser(this.user.id)

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

    async updateUser(id, userData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        for (const key in userData) {
          if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key])
          }
        }
        if (userData.photo === '') {
          formData.append('remove_image', '1')
        }

        await axios.put(`/users/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('User profile updated successfully!')
        await this.fetchUser(id)
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchUser(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.user = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch user'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
  },
})
