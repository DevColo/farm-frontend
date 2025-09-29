// stores/pasture.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const usePastureStore = defineStore('pasture', {
  state: () => ({
    pastures: [],
  }),
  actions: {
    async createPasture(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-pasture', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Pasture created successfully!')
        this.fetchPastures()
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
    async fetchPastures() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/pastures', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.pastures = response.data.data
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

    async editPasture(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-pasture`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Pasture updated successfully')
        this.fetchPastures()
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
  },
})
