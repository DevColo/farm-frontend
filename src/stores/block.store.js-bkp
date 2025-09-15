// stores/block.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useBlockStore = defineStore('block', {
  state: () => ({
    block: [],
  }),
  actions: {
    async createBlock(payload) {
      const toast = useToast()
      this.block.push(payload)
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/block', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Block created successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchBlock() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/block', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.block = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch block'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteBlock(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/block/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted block from state
        this.block = this.block.filter((p) => p.id !== id)
        toast.success('Block deleted successfully')
      } catch (error) {
        toast.error('Failed to delete block')
      }
    },

    async editBlock(id, updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.put(`/api/block/${id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Update block in state
        const index = this.block.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.block[index] = response.data
        }
        toast.success('Block updated successfully')
      } catch (error) {
        toast.error('Failed to update block')
      }
    },
  },
})
