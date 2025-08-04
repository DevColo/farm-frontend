// stores/parcel.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useParcelStore = defineStore('parcel', {
  state: () => ({
    parcel: [], // list of parcels
  }),

  actions: {
    async createParcel(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.post('/api/parcel', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Add parcel returned from backend (with ID)
        this.parcel.push(response.data)
        toast.success('Parcel created successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async fetchParcel() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/parcel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.parcel = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch parcels'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async deleteParcel(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/parcel/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted parcel from state
        this.parcel = this.parcel.filter((p) => p.id !== id)
        toast.success('Parcel deleted successfully')
      } catch (error) {
        toast.error('Failed to delete parcel')
      }
    },

    async editParcel(id, updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.put(`/api/parcel/${id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Update parcel in state
        const index = this.parcel.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.parcel[index] = response.data
        }
        toast.success('Parcel updated successfully')
      } catch (error) {
        toast.error('Failed to update parcel')
      }
    },
  },
})