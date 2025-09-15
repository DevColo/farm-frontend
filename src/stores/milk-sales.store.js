import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useMilkSalesStore = defineStore('milkSale', {
  state: () => ({
    milkSales: [],
    milkSale: [],
  }),
  actions: {
    async createMilkSales(salesData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/milk-sales', salesData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Milk Sales created successfully!')
        await this.fetchMilkSales()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchMilkSales() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/milk-sales', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.milkSales = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch milkSales'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editMilkSales(id, salesData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.put(`/api/milk-sales/${id}`, salesData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Milk Sales updated successfully!')
        await this.fetchMilkSales()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async deleteMilkSales(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/milk-sales/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Milk Sales deleted successfully!')
        await this.fetchMilkSales()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete Milk Sales')
      }
    },
  },
})
