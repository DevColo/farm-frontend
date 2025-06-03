import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useDashboardStore = defineStore('dashboardData', {
  state: () => ({
    dashboardData: [],
    dashboardStats: [],
  }),
  actions: {
    async fetchDashboardData() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/dashboard/data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.dashboardData = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Dashboard Data'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async fetchDashboardStats() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.dashboardStats = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Dashboard Data'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
  },
})
