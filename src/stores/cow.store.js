import { defineStore } from 'pinia'
import axios from 'axios'

export const useCowStore = defineStore('cow', {
  state: () => ({
    cows: [],
  }),
  actions: {
    async createCow(cowData) {
      try {
        const response = await axios.post('/api/cows', cowData)
        this.cows.push(response.data)
        toast.success('Cow created successfully!')
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchCows() {
      try {
        const response = await axios.get('/api/cows')
        this.cows = response.data
      } catch (error) {
        console.error('Failed to fetch cows:', error)
      }
    },
  },
})
