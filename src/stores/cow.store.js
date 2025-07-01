import { defineStore } from 'pinia'
import axios from '@axios'
import { useToast } from 'vue-toastification'

export const useCowStore = defineStore('cow', {
  state: () => ({
    cows: [],
    pasture: [],
  }),
  actions: {
    async createCow(cowData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        for (const key in cowData) {
          if (cowData[key] !== undefined && cowData[key] !== null) {
            formData.append(key, cowData[key])
          }
        }

        await axios.post('/api/cows', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('Cow created successfully!')
        await this.fetchCows()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchCows() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/cows', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cows = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch cows'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editCow(id, cowData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        for (const key in cowData) {
          if (cowData[key] !== null && cowData[key] !== undefined) {
            formData.append(key, cowData[key])
          }
        }
        if (cowData.image === '') {
          formData.append('remove_image', '1')
        }

        await axios.put(`/api/cows/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        toast.success('Cow updated successfully!')
        await this.fetchCows()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
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
        await this.fetchCows()
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
