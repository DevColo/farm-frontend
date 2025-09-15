import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useFoodStore = defineStore('food', {
  state: () => ({
    foods: [],
    pasture: [],
  }),
  actions: {
    async createFood(foodData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/foods', foodData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Food Record created successfully!')
        await this.fetchFoods()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchFoods() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/foods', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.foods = response.data
      } catch (error) {
        let errorMessage = 'Failed to fetch foods'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async editFood(id, foodData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.put(`/api/foods/${id}`, foodData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Food Record updated successfully!')
        await this.fetchFoods()
      } catch (error) {
        let errorMessage = 'Something went wrong'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.error
        }
        toast.error(errorMessage)
      }
    },

    async deleteFood(id) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        await axios.delete(`/api/foods/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        toast.success('Food Record deleted successfully!')
        await this.fetchFoods()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete Food Record')
      }
    },
  },
})
