// stores/harvest.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useOtherExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    expense: [],
  }),
  actions: {
    async createExpense(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-other-expense', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Expense created successfully!')
        this.fetchExpenses()
        return 1;
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
        return 0;
      }
    },
    async fetchExpenses() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/other-expenses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.expenses = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch harvest'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteExpense(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/other-expenses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Harvest from state
        this.expenses = this.expenses.filter((p) => p.id !== id)
        toast.success('Expense deleted successfully')
      } catch (error) {
        toast.error('Failed to delete harvest')
      }
    },

    async editExpense(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-other-expense`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Expense updated successfully')
        this.fetchExpenses()
        return 1;
      } catch (error) {
        // let errorMessage = 'Something went wrong'

        // if (error.response && error.response.data) {
        //   errorMessage = error.response.data.error
        // }
        // toast.error(errorMessage)
        return 0;
      }
    },

    async fetchHarvestById(id) {
          const toast = useToast()
          this.loading = true
          
          try {
            const token = localStorage.getItem('user_token')
            const response = await axios.get(`/api/get-other-expense/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            if (response.data.success) {
              this.harvest = response.data.data
            } else {
              this.harvest = null
            }
          } catch (error) {
            this.handleError(error, 'Failed to fetch harvest details')
            this.harvest = null
          } finally {
            this.loading = false
          }
        },
  },
})
