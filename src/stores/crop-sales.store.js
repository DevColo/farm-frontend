// stores/CropSale.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useCropSaleStore = defineStore('cropSale', {
  state: () => ({
    cropSales: [],
    cropSale: [],
  }),
  actions: {
    async createCropSale(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-crop-sale', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Crop Sale created successfully!')
        this.fetchCropSales()
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
    async fetchCropSales() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/crop-sales', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.cropSales = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Crop Sale'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteCropSale(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/crop-sale/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        // Remove deleted Crop Sale from state
        this.cropSales = this.cropSales.filter((p) => p.id !== id)
        toast.success('Crop Sale deleted successfully')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
        return 0;
      }
    },

    async editCropSale(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-crop-sale`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Crop Sale updated successfully')
        this.fetchCropSales()
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

    async fetchCropSaleById(id) {
          const toast = useToast()
          this.loading = true
          
          try {
            const token = localStorage.getItem('user_token')
            const response = await axios.get(`/api/get-crop-sale/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            if (response.data.success) {
              this.cropSale = response.data.data
            } else {
              this.cropSale = null
            }
          } catch (error) {
            this.handleError(error, 'Failed to fetch cropSale details')
            this.cropSale = null
          } finally {
            this.loading = false
          }
        },
  },
})
