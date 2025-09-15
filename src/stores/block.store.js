// stores/farm.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useBlockStore = defineStore('block', {
  state: () => ({
    blocks: [],
  }),
  actions: {
    async createBlock(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-block', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Block created successfully!')
        this.fetchBlocks()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },
    async fetchBlocks() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/blocks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.blocks = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Farm'
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
        await axios.delete(`/api/blocks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Block from state
        this.blocks = this.blocks.filter((p) => p.id !== id)
        toast.success('Block deleted successfully')
      } catch (error) {
        toast.error('Failed to delete farm')
      }
    },

    async editBlock(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-block`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Block updated successfully')
        this.fetchBlocks()
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
