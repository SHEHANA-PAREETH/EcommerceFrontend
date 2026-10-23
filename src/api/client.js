import axios from 'axios'

export const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const client = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true,
  // the API refuses state-changing requests without this header in production (CSRF protection)
  headers: { 'X-Requested-With': 'shop' },
  timeout: 20000,
})

// the message to show a person for any failed request
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.error) return error.response.data.error
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') return "We can't reach the server. Check your connection and try again."
  return fallback
}

export default client
