import { defineStore } from 'pinia'
import axios from '@/axios'
import { useToast } from 'vue-toastification'

export const useCountryStore = defineStore('country', {
  state: () => ({
    countries: [],
    pasture: [],
  }),
  actions: {
    async createCountry(countryData) {
      const toast = useToast()

      try {
        const token = localStorage.getItem('user_token')

        const formData = new FormData()
        for (const key in countryData) {
          if (countryData[key] !== undefined && countryData[key] !== null) {
            formData.append(key, countryData[key])
          }
        }

        const response = await axios.post('/api/add-country', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        //if(!response.success){
         // message = response.error.country[0]
       // }else{
          message = 'Country created successfully!'
       // }
        toast.success(message)
        await this.fetchCountries()
      } catch (error) {
        let errorMessage = 'Country already exist!'
        if (error.response && error.response.error) {
          errorMessage = error.response.error
        }
        toast.error(errorMessage)
      }
    },

    async fetchCountries() {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')
        const response = await axios.get('/api/countries', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.countries = response.data.data
      } catch (error) {
        let errorMessage = 'Failed to fetch countries'
        if (error.response && error.response.data) {
          errorMessage = error.response.error.country[0]
          //errorMessage = error.response.data.error || error.response.data.message
        }
        toast.error(errorMessage)
      }
    },

    async updateCountry(countryData) {
      const toast = useToast()
      try {
        const token = localStorage.getItem('user_token')

        const response = await axios.post(`/api/update-country`, countryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        message = 'Country updated successfully!'
        toast.success(message)
        await this.fetchCountries()
      } catch (error) {
        let errorMessage = 'Something went wrong'
        if (error.response && error.response.data) {
          errorMessage = error.response.error.country[0]
        }
        toast.error(errorMessage)
      }
    },
  },
})
