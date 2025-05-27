// stores/pasture.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const usePastureStore = defineStore('pasture', {
  state: () => ({
    pastures: [],
  }),
  actions: {
    async createPasture(payload) {
      const toast = useToast()
      this.pastures.push(payload)
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/pastures', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Pasture created successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchPastures() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/pastures', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('Fetched pastures:', response.data)
        this.pastures = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch pastures'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deletePasture(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/pastures/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted pasture from state
        this.pastures = this.pastures.filter((p) => p.id !== id)
        toast.success('Pasture deleted successfully')
      } catch (error) {
        toast.error('Failed to delete pasture')
      }
    },

    async editPasture(id, updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.put(`/api/pastures/${id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Update pasture in state
        const index = this.pastures.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.pastures[index] = response.data
        }
        toast.success('Pasture updated successfully')
      } catch (error) {
        toast.error('Failed to update pasture')
      }
    },
  },
})
