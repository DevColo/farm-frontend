// stores/employee.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useEmplyeeStore = defineStore('employee', {
  state: () => ({
    employee: [],
  }),
  actions: {
    async createEmployee(payload) {
      const toast = useToast()
      this.employee.push(payload)
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/employee', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Employee created successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchEmployee() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/employee', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.employee = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch employee'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteEmployee(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted employee from state
        this.employee = this.employee.filter((p) => p.id !== id)
        toast.success('Employee deleted successfully')
      } catch (error) {
        toast.error('Failed to delete employee')
      }
    },

    async editEmployee(id, updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.put(`/api/employee/${id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Update employee in state
        const index = this.employee.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.employee[index] = response.data
        }
        toast.success('Employee updated successfully')
      } catch (error) {
        toast.error('Failed to update employee')
      }
    },
  },
})
