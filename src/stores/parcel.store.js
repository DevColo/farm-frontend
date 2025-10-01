// stores/parcel.store.js
import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useParcelStore = defineStore('parcel', {
  state: () => ({
    parcels: [],
    parcel: [],
  }),
  actions: {
    async createParcel(payload) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/add-parcel', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Parcel created successfully!')
        this.fetchParcels()
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
    async fetchParcels() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/parcels', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.parcels = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch Parcel'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },
    async deleteParcel(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.delete(`/api/parcels/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Remove deleted Parcel from state
        this.parcels = this.parcels.filter((p) => p.id !== id)
        toast.success('Parcel deleted successfully')
      } catch (error) {
        toast.error('Failed to delete Parcel')
      }
    },

    async editParcel(updatedData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        await axios.post(`/api/update-parcel`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        toast.success('Parcel updated successfully')
        this.fetchParcels()
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

    async fetchParcelById(id) {
          this.loading = true
          
          try {
            const token = localStorage.getItem('user_token')
            const response = await axios.get(`/api/get-parcel/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            
            if (response.data.success) {
              this.parcel = response.data.data
            } else {
              this.parcel = null
            }
          } catch (error) {
            this.handleError(error, 'Failed to fetch parcel details')
            this.parcel = null
          } finally {
            this.loading = false
          }
        },
  },
})
