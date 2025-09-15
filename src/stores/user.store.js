import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: [],
    users: [],
    pasture: [],
  }),
  actions: {
    // Create new user
    async createUser(userData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()

        // Map userData to formData
        for (const key in userData) {
          if (userData[key] !== undefined && userData[key] !== null) {
            // If key is country, send only the value (or ID if you use IDs)
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
          // Optional: show first validation error
          const firstErrorKey = Object.keys(error.response.data.errors)[0]
          errorMessage = error.response.data.errors[firstErrorKey][0]
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    // Fetch all users
    async fetchUsers() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.users = response.data.data
        console.log(this.users)
      } catch (error) {
        let errorMessage = 'Failed to fetch users'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    // Update user by ID
    async updateUser(id, userData) {
      console.log('id: '+ id)
      console.log('userData: '+ userData)
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

        await axios.put(`/api/users/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('User profile updated successfully!')
        await this.fetchUser(id)
      } catch (error) {
        // let errorMessage = 'Something went wrong'
        // if (error.response && error.response.data) {
        //   errorMessage = error.response.data.error
        // }
        // toast.error(errorMessage)
      }
    },

    // Fetch curren user
    async getCurrentUser() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-current-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.user = response.data.data
        console.log(this.user)
      } catch (error) {
        let errorMessage = 'Failed to fetch users'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    // Fetch single user by ID
    async getUserById(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.users = response.data.data
        console.log(this.users)
      } catch (error) {
        let errorMessage = 'Failed to fetch users'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    // Update current user
    async updateCurrentUser(userData) {
      console.log('userData: '+ userData)
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

        await axios.post(`/api/update-current-user`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('User profile updated successfully!')
        await this.getCurrentUser()
      } catch (error) {
        // let errorMessage = 'Something went wrong'
        // if (error.response && error.response.data) {
        //   errorMessage = error.response.data.error
        // }
        // toast.error(errorMessage)
      }
    },
  },
})
