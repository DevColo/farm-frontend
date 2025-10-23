// stores/harvest.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useHarvestStore = defineStore('harvest', {
  state: () => ({
    harvests: [],
    harvest: [],
  }),
  actions: {
    async createHarvest(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-harvest', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Harvest created successfully!')
        this.fetchHarvests()
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
    async fetchHarvests() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/harvests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.harvests = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch harvest'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteHarvest(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/delete-harvest/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Harvest from state
        this.harvests = this.harvests.filter((p) => p.id !== id)
        toast.success('Harvest deleted successfully')
      } catch (error) {
        toast.error('Failed to delete harvest')
      }
    },

    async editHarvest(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-harvest`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Harvest updated successfully')
        this.fetchHarvests()
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
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-harvest/${id}`, {
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

    async fetchHarvestsByFarmId(id) {
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-harvests-by-farm/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.harvests = response.data.data
        } else {
          this.harvests = null
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch harvest details')
        this.harvests = null
      } finally {
        this.loading = false
      }
    },
  },
})
