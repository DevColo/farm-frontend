// src/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://api.jakaja.net/api',
  //baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional: for handling cookies
})

export default instance
