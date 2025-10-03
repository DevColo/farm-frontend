// stores/target.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useTargetStore = defineStore('target', {
  state: () => ({
    targets: [],
    target: [],
  }),
  actions: {
    async createTarget(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-target', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Target created successfully!')
        this.fetchTargets()
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
    async fetchTargets() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/targets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.targets = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Target'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteTarget(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/targets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Target from state
        this.targets = this.targets.filter((p) => p.id !== id)
        toast.success('Target deleted successfully')
      } catch (error) {
        toast.error('Failed to delete Target')
      }
    },

    async editTarget(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-target`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Target updated successfully')
        this.fetchTargets()
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

    async fetchTargetById(id) {
          this.loading = true
          
          try {
            const token = localStorage.getItem('user_token')
            const response = await axios.get(`/api/get-target/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            if (response.data.success) {
              this.target = response.data.data
            } else {
              this.target = null
            }
          } catch (error) {
            this.handleError(error, 'Failed to fetch target details')
            this.target = null
          } finally {
            this.loading = false
          }
        },
  },
})
