// src/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional: for handling cookies
})

export default instance
