import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useCowStore = defineStore('cow', {
  state: () => ({
    cows: [],
  }),
  actions: {
    async fetchDashboardData() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/get-dashboard-data', {
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
  },
})
