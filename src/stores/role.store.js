import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    pasture: [],
  }),
  actions: {
    async createRole(userData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        for (const key in userData) {
          if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key])
          }
        }

        await axios.post('/api/roles', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('Role created successfully!')
        await this.fetchRoles()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchRoles() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/roles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.roles = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch roles'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
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

        await axios.put(`/api/roles/${id}`, formData, {
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

    async deleteCow(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/cows/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Cow deleted successfully!')
        await this.fetchroles()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete cow')
      }
    },

    async fetchPastureCows(pastureId) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-pasture/${pastureId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cows = response.data.cows
        this.pasture = response.data.pasture
      } catch (error) {
        let errorMessage = 'Failed to fetch cows'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async fetchBreedCows(breed) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-breed/${breed}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cows = response.data.cows
      } catch (error) {
        let errorMessage = 'Failed to fetch cows'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async fetchGenderCows(gender) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-gender/${gender}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cows = response.data.cows
      } catch (error) {
        let errorMessage = 'Failed to fetch cows'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async fetchClassCows(cowClass) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-class/${cowClass}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cows = response.data.cows
      } catch (error) {
        let errorMessage = 'Failed to fetch cows'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
  },
})
