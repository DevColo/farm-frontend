import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useCowSalesStore = defineStore('cowSale', {
  state: () => ({
    cowSales: [],
    cowSale: [],
  }),
  actions: {
    async createCowSales(salesData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/cow-sales', salesData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Cow Sales created successfully!')
        await this.fetchCowSales()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchCowSales() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/cow-sales', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cowSales = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch milkSales'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editCowSales(id, salesData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.put(`/api/cow-sales/${id}`, salesData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Cow Sales updated successfully!')
        await this.fetchCowSales()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async deleteCowSales(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/cow-sales/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Cow Sales deleted successfully!')
        await this.fetchCowSales()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete Cow Sales')
      }
    },
  },
})
