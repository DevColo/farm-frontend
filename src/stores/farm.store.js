// stores/farm.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useFarmStore = defineStore('farm', {
  state: () => ({
    farm: [],
  }),
  actions: {
    async createFarm(payload) {
      const toast = useToast()
      this.farm.push(payload)
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/farm', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Farm created successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchFarm() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/farm', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.farm = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch farm'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteFarm(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/farm/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted farm from state
        this.farm = this.farm.filter((p) => p.id !== id)
        toast.success('Farm deleted successfully')
      } catch (error) {
        toast.error('Failed to delete farm')
      }
    },

    async editFarm(id, updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.put(`/api/farm/${id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Update farm in state
        const index = this.farm.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.farm[index] = response.data
        }
        toast.success('Farm updated successfully')
      } catch (error) {
        toast.error('Failed to update farm')
      }
    },
  },
})
