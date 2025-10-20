// stores/block.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useBlockStore = defineStore('block', {
  state: () => ({
    blocks: [],
    block: [],
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
        await axios.delete(`/api/blocks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Block from state
        this.blocks = this.blocks.filter((p) => p.id !== id)
        toast.success('Block deleted successfully')
      } catch (error) {
        toast.error('Failed to delete block')
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

    async fetchBlockById(id) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-block/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.block = response.data.data
        } else {
          this.block = null
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch block details')
        this.block = null
      } finally {
        this.loading = false
      }
    },

    async fetchBlocksByFarmId(id) {
      this.loading = true
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/get-blocks-by-farm/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.blocks = response.data.data
        } else {
          this.blocks = null
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch blocks')
        this.blocks = null
      } finally {
        this.loading = false
      }
    },
  },
})
