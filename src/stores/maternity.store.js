import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useMaternityStore = defineStore('maternity', {
  state: () => ({
    maternities: [],
    pasture: [],
  }),
  actions: {
    async createMaternity(maternityData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/maternities', maternityData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Maternity Record created successfully!')
        await this.fetchMaternities()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchMaternities() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/maternities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.maternities = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch maternities'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editMaternity(id, maternityData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.put(`/api/maternities/${id}`, maternityData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Maternity Record updated successfully!')
        await this.fetchMaternities()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async deleteMaternity(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/maternities/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Maternity Record deleted successfully!')
        await this.fetchMaternities()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete Maternity Record')
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
