import axios from 'axios'

const api = axios.create({
  baseURL: 'https://ai-powered-complaint-management-system-4ixh.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api