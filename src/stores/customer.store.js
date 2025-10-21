import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    customer: [],
  }),
  actions: {
    async createCustomer(customerData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-customer', customerData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Customer Record created successfully!')
        await this.fetchCustomers()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchCustomers() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/customers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.customers = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Customer'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editCustomer(customerData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.post(`/api/update-customer`, customerData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Customer Record updated successfully!')
        await this.fetchCustomers()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async deleteCustomer(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Customer Record deleted successfully!')
        await this.fetchCustomers()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete Customer Record')
      }
    },

    async fetchCustomerById(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.customer = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Customer details'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
  },
})
