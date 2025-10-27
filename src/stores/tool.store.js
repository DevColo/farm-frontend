// stores/harvest.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useToolStore = defineStore('tool', {
  state: () => ({
    tools: [],
    tool: [],
  }),
  actions: {
    async createTool(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-tool', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Tool created successfully!')
        this.fetchTools()
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
    async fetchTools() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/tools', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.tools = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch harvest'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteTool(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/tools/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Harvest from state
        this.tools = this.tools.filter((p) => p.id !== id)
        toast.success('Tool deleted successfully')
      } catch (error) {
        toast.error('Failed to delete harvest')
      }
    },

    async editTool(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-tool`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Tool updated successfully')
        this.fetchTools()
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
            const response = await axios.get(`/api/get-tool/${id}`, {
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
