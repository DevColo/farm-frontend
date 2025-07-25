import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useFeedingStore = defineStore('feeding', {
  state: () => ({
    feedings: [],
    pasture: [],
  }),
  actions: {
    async createFeeding(feedingData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/feedings', feedingData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Feeding Record created successfully!')
        await this.fetchFeedings()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchFeedings() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/feedings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.feedings = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch feedings'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editFeeding(id, feedingData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.put(`/api/feedings/${id}`, feedingData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Feeding Record updated successfully!')
        await this.fetchFeedings()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async deleteFeeding(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/feedings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Feeding Record deleted successfully!')
        await this.fetchFeedings()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete Feeding Record')
      }
    },
  },
})
