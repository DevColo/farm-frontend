// stores/milk.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
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
        await axios.post('/api/add-milk-record', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Daily Milk Record added successfully!')
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
    async fetchMilkRecords() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/daily-milk-records', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.milkRecords = response.data.data
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
        await axios.get(`/api/delete-milk-record/${id}`, {
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

    async editMilkRecord(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-milk-record`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Daily Milk Record updated successfully')
        return 1;
      } catch (error) {
        toast.error('Failed to update Daily Milk Record')
        return 0;
      }
    },
  },
})
