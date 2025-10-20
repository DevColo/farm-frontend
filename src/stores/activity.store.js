// stores/harvest.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    activity: [],
  }),
  actions: {
    async createActivity(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-activity', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Activity created successfully!')
        this.fetchActivities()
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
    async fetchActivities() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/activities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.activities = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch harvest'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteActivity(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/activities/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Harvest from state
        this.activities = this.activities.filter((p) => p.id !== id)
        toast.success('Activity deleted successfully')
      } catch (error) {
        toast.error('Failed to delete harvest')
      }
    },

    async editActivity(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-activity`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Activity updated successfully')
        this.fetchActivities()
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
            const response = await axios.get(`/api/get-activity/${id}`, {
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
