import axios from 'axios'

const BASE_URL = import.meta.env.VITE_ORIGIN_URL || 'http://localhost:8080'

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// On 401, try once to refresh the access token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${BASE_URL}/api/auth/refresh`,
                        { refreshToken }
                    )
                    localStorage.setItem('accessToken', data.accessToken)
                    original.headers.Authorization = `Bearer ${data.accessToken}`
                    return api(original)
                } catch {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login'
                    }
                }
            } else {
                // No refresh token — user is not logged in; let route guards handle navigation
                localStorage.removeItem('accessToken')
            }
        }

        return Promise.reject(error)
    }
)

export default api
