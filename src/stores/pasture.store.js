// stores/pasture.store.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const usePastureStore = defineStore('pasture', {
  state: () => ({
    pastures: [],
  }),
  actions: {
    async createPasture(payload) {
      try {
        const token = localStorage.getItem('auth_token')
        await axios.post('/api/add-pasture', payload, {
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
