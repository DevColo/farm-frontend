// stores/pasture.store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const usePastureStore = defineStore('pasture', {
  state: () => ({
    pastures: [],
  }),
  actions: {
    async createPasture(payload) {
      const toast = useToast()
      this.pastures.push(payload)
      console.log('Payload:', payload)
      try {
        const token = localStorage.getItem('user_token')
        await axios.post('/api/pastures', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Pasture created successfully!')
      } catch (error) {
        toast.error(error)
      }
    },
  },
})
