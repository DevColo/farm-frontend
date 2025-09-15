import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useCowStore = defineStore('cow', {
  state: () => ({
    cows: [],
    cow: null,
    pasture: null,
    femaleCows: [],
    maleCows: [],
    loading: false,
  }),
  
  getters: {
    // Get cows by gender for parent selection
    femaleParentOptions: (state) => {
      return state.femaleCows.map(cow => ({
        id: cow.id,
        name: cow.name,
        ear_tag: cow.ear_tag,
        label: `${cow.name} (${cow.ear_tag})`,
        value: cow.id
      }))
    },
    
    maleParentOptions: (state) => {
      return state.maleCows.map(cow => ({
        id: cow.id,
        name: cow.name,
        ear_tag: cow.ear_tag,
        label: `${cow.name} (${cow.ear_tag})`,
        value: cow.id
      }))
    },
    
    // Get total count
    totalCows: (state) => state.cows.length,
  },
  
  actions: {
    async createCow(cowData) {
      const toast = useToast()
      this.loading = true

      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        
        // Append all cow data to FormData
        for (const key in cowData) {
          if (cowData[key] !== undefined && cowData[key] !== null && cowData[key] !== '') {
            formData.append(key, cowData[key])
          }
        }

        const response = await axios.post('/api/cows/add-cow', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.success) {
          toast.success(response.data.message || 'Cow created successfully!')
          await this.fetchCows()
        }
      } catch (error) {
        this.handleError(error, 'Failed to create cow')
      } finally {
        this.loading = false
      }
    },

    async fetchCows() {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/cows', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.cows = response.data.data || []
        } else {
          this.cows = []
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch cows')
        this.cows = []
      } finally {
        this.loading = false
      }
    },

    async editCow(id, cowData) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        
        // Append all cow data to FormData
        for (const key in cowData) {
          if (cowData[key] !== null && cowData[key] !== undefined) {
            formData.append(key, cowData[key])
          }
        }
        
        // Handle image removal
        if (cowData.image === null || cowData.image === '') {
          formData.append('remove_image', '1')
        }

        const response = await axios.post(`/api/cows/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.success) {
          toast.success(response.data.message || 'Cow updated successfully!')
          await this.fetchCows()
        }
      } catch (error) {
        this.handleError(error, 'Failed to update cow')
      } finally {
        this.loading = false
      }
    },

    async deleteCow(id) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')

        const response = await axios.delete(`/api/cows/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast.success(response.data.message || 'Cow deleted successfully!')
          await this.fetchCows()
        }
      } catch (error) {
        this.handleError(error, 'Failed to delete cow')
      } finally {
        this.loading = false
      }
    },

    async fetchCowById(id) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.cow = response.data.data
        } else {
          this.cow = null
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch cow details')
        this.cow = null
      } finally {
        this.loading = false
      }
    },

    async fetchCowsByGender(gender) {
      const toast = useToast()
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-gender`, {
          params: { gender },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          return response.data.data || []
        }
        return []
      } catch (error) {
        this.handleError(error, `Failed to fetch ${gender.toLowerCase()} cows`)
        return []
      }
    },

    async fetchMaleCows() {
      this.maleCows = await this.fetchCowsByGender('Male')
    },

    async fetchFemaleCows() {
      this.femaleCows = await this.fetchCowsByGender('Female')
    },

    // Additional methods for filtering (these would need corresponding backend routes)
    async fetchPastureCows(pastureId) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-pasture/${pastureId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.cows = response.data.data.cows || []
          this.pasture = response.data.data.pasture || null
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch pasture cows')
      } finally {
        this.loading = false
      }
    },

    async fetchBreedCows(breed) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-breed/${breed}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.cows = response.data.data.cows || []
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch breed cows')
      } finally {
        this.loading = false
      }
    },

    async fetchGenderCows(gender) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-gender/${gender}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.cows = response.data.data.cows || []
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch gender cows')
      } finally {
        this.loading = false
      }
    },

    async fetchClassCows(cowClass) {
      const toast = useToast()
      this.loading = true
      
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get(`/api/cows/by-class/${cowClass}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.data.success) {
          this.cows = response.data.data.cows || []
        }
      } catch (error) {
        this.handleError(error, 'Failed to fetch class cows')
      } finally {
        this.loading = false
      }
    },

    // Utility method to check if ear tag is unique
    async checkEarTagUnique(earTag, cowId = null) {
      try {
        const token = localStorage.getItem('user_token')
        const params = { ear_tag: earTag }
        if (cowId) {
          params.cow_id = cowId
        }
        
        const response = await axios.get('/api/cows/check-ear-tag', {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        return response.data.available || false
      } catch (error) {
        console.error('Error checking ear tag uniqueness:', error)
        return false
      }
    },

    // Load parent options for form
    async loadParentOptions() {
      await Promise.all([
        this.fetchFemaleCows(),
        this.fetchMaleCows()
      ])
    },

    // Clear cow data
    clearCow() {
      this.cow = null
    },

    clearCows() {
      this.cows = []
    },

    // Error handler
    handleError(error, defaultMessage) {
      const toast = useToast()
      let errorMessage = defaultMessage

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else if (error.response.data.errors) {
          // Handle validation errors
          const errors = error.response.data.errors
          errorMessage = Object.values(errors).flat().join(', ')
        }
      }

      toast.error(errorMessage)
      console.error('Cow Store Error:', error)
    },

    // Get cow image URL
    getCowImageUrl(cow) {
      if (!cow || !cow.image) {
        return '/images/default-cow.jpg' // Default image path
      }
      
      // If image starts with http, it's already a full URL
      if (cow.image.startsWith('http')) {
        return cow.image
      }
      
      // Otherwise, construct the URL for cow_images folder
      return `/cow_images/${cow.image}`
    },

    // Format cow for display
    formatCowForDisplay(cow) {
      if (!cow) return null
      
      return {
        ...cow,
        image_url: this.getCowImageUrl(cow),
        parent_info: cow.parent ? {
          mother: cow.parent.mother ? `${cow.parent.mother.name} (${cow.parent.mother.ear_tag})` : 'Unknown',
          father: cow.parent.father ? `${cow.parent.father.name} (${cow.parent.father.ear_tag})` : 'Unknown'
        } : {
          mother: 'Unknown',
          father: 'Unknown'
        }
      }
    }
  },
})