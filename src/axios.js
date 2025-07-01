// src/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://api.jakaja.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional: for handling cookies
})

export default instance
