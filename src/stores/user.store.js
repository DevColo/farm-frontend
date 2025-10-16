import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},      // Single user (current or fetched by ID)
    users: [],     // All users
    pasture: [],   // Optional
  }),
  actions: {
    async createUser(userData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const formData = new FormData()
        for (const key in userData) {
          if (userData[key] !== undefined && userData[key] !== null) {
            if (key === 'country' && typeof userData[key] === 'object') {
              formData.append(key, userData[key].value)
            } else {
              formData.append(key, userData[key])
            }
          }
        }
        await axios.post('/api/add-user', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        toast.success('User created successfully!')
        await this.fetchUsers()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response?.data?.errors) {
          const firstErrorKey = Object.keys(error.response.data.errors)[0]
          errorMessage = error.response.data.errors[firstErrorKey][0]
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchUsers() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.users = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch users'
        if (error.response?.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    // Updated: fetch single user and assign to this.user
    async getUserById(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.user = response.data.data  // <-- assign to `user` so component can use it
      } catch (error) {
        let errorMessage = 'Failed to fetch user'
        if (error.response?.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async getCurrentUser() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/get-current-user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.user = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch current user'
        if (error.response?.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async updateUser(userData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const formData = new FormData()
        for (const key in userData) {
          if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key])
          }
        }
        if (userData.photo === '') formData.append('remove_image', '1')

        await axios.post('/api/update-user', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('User updated successfully!')
        if (userData.id) await this.getUserById(userData.id)
      } catch (error) {
        toast.error('Failed to update user')
      }
    },

    async updateCurrentUser(userData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const formData = new FormData()
        for (const key in userData) {
          if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key])
          }
        }
        if (userData.photo === '') formData.append('remove_image', '1')

        await axios.post('/api/update-current-user', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('Profile updated successfully!')
        await this.getCurrentUser()
      } catch (error) {
        toast.error('Failed to update profile')
      }
    },
  },
})
