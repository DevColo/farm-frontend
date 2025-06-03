// stores/milk.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useMilkStore = defineStore('milk', {
  state: () => ({
    milkRecords: [],
  }),
  actions: {
    async createMilkRecord(payload) {
      const toast = useToast()
      this.milkRecords.push(payload)
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/daily-milk-records', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Daily Milk Record added successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchMilkRecords() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/daily-milk-records', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.milkRecords = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Daily Milk Record'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteMilkRecord(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/daily-milk-records/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Daily Milk Record from state
        this.milkRecords = this.milkRecords.filter((p) => p.id !== id)
        toast.success('Daily Milk Record deleted successfully')
      } catch (error) {
        toast.error('Failed to delete Daily Milk Record')
      }
    },

    async editMilkRecord(id, updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.put(`/api/daily-milk-records/${id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Update Daily Milk Record in state
        const index = this.milkRecords.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.milkRecords[index] = response.data
        }
        toast.success('Daily Milk Record updated successfully')
      } catch (error) {
        toast.error('Failed to update Daily Milk Record')
      }
    },
  },
})
