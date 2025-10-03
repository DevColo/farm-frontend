// stores/tree.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useTreeStore = defineStore('tree', {
  state: () => ({
    trees: [],
    tree: [],
  }),
  actions: {
    async createTree(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-tree', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('tree created successfully!')
        this.fetchTrees()
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
    async fetchTrees() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/trees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.trees = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch tree'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteTree(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.get(`/api/delete-tree/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted tree from state
        this.trees = this.trees.filter((p) => p.id !== id)
        toast.success('tree deleted successfully')
      } catch (error) {
        toast.error('Failed to delete tree')
      }
    },

    async editTree(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-tree`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('tree updated successfully')
        this.fetchTrees()
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

    async fetchTreeById(id) {
          const toast = useToast()
          this.loading = true
          
          try {
            const token = localStorage.getItem('user_token')
            const response = await axios.get(`/api/get-tree/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            if (response.data.success) {
              this.tree = response.data.data
            } else {
              this.tree = null
            }
          } catch (error) {
            this.handleError(error, 'Failed to fetch tree details')
            this.tree = null
          } finally {
            this.loading = false
          }
        },
  },
})
