// stores/farm.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useFarmStore = defineStore('farm', {
  state: () => ({
    farms: [],
  }),
  actions: {
    async createFarm(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-farm', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Farm created successfully!')
        this.fetchFarms()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchFarms() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/farms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.farms = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Farm'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteFarm(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/farms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Farm from state
        this.farms = this.farms.filter((p) => p.id !== id)
        toast.success('Farm deleted successfully')
      } catch (error) {
        toast.error('Failed to delete farm')
      }
    },

    async editFarm(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-farm`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Farm updated successfully')
        this.fetchFarms()
      } catch (error) {
        // let errorMessage = 'Something went wrong'

        // if (error.response && error.response.data) {
        //   errorMessage = error.response.data.error
        // }
        // toast.error(errorMessage)
      }
    },
  },
})
