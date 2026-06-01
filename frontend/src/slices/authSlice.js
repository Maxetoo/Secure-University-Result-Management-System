import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

const isLoggedIn = () => !!localStorage.getItem('accessToken')

const initialState = {
    register: {
        inputs: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'student',
            matricNumber: '',
            level: '',
            staffId: '',
            departmentCode: '',
        },
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
    login: {
        inputs: { email: '', password: '' },
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
    forgotPassword: {
        email: '',
        load: false,
        error: false,
        sent: false,
        message: '',
    },
    resetPassword: {
        load: false,
        error: false,
        successMsg: '',
        errorMsg: '',
    },
    updatePassword: {
        inputs: { currentPassword: '', newPassword: '' },
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
    logout: { load: false },
    isAuthenticated: isLoggedIn(),
}

// POST /api/register
export const register = createAsyncThunk('auth/register', async (payload) => {
    try {
        const resp = await api.post('/api/register', payload)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// POST /api/login
export const login = createAsyncThunk('auth/login', async (payload) => {
    try {
        const resp = await api.post('/api/login', payload)
        const { accessToken, refreshToken } = resp.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// POST /api/auth/logout
export const logout = createAsyncThunk('auth/logout', async () => {
    try {
        await api.post('/api/auth/logout')
    } catch {
        // ignore errors — always clear local state
    } finally {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }
    return { status: 'success' }
})

// POST /api/auth/forgot-password
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }) => {
    try {
        const resp = await api.post('/api/auth/forgot-password', { email })
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// POST /api/auth/reset-password
export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload) => {
    try {
        const resp = await api.post('/api/auth/reset-password', payload)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// PATCH /api/auth/update-password
export const updatePassword = createAsyncThunk('auth/updatePassword', async (payload) => {
    try {
        const resp = await api.patch('/api/auth/update-password', payload)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        fillLoginInputs(state, action) {
            const { name, value } = action.payload
            state.login.inputs[name] = value
        },
        fillRegisterInputs(state, action) {
            const { name, value } = action.payload
            state.register.inputs[name] = value
        },
        fillForgotPasswordEmail(state, action) {
            state.forgotPassword.email = action.payload
        },
        fillUpdatePasswordInputs(state, action) {
            const { name, value } = action.payload
            state.updatePassword.inputs[name] = value
        },
        clearAuthNotifications(state) {
            state.login.error = false
            state.login.errorMsg = ''
            state.login.successMsg = ''
            state.register.error = false
            state.register.errorMsg = ''
            state.register.successMsg = ''
            state.forgotPassword.error = false
            state.forgotPassword.sent = false
            state.forgotPassword.message = ''
            state.resetPassword.error = false
            state.resetPassword.errorMsg = ''
            state.resetPassword.successMsg = ''
            state.updatePassword.error = false
            state.updatePassword.errorMsg = ''
            state.updatePassword.successMsg = ''
        },
    },
    extraReducers(builder) {
        builder
            // register
            .addCase(register.pending, (state) => {
                state.register.load = true
                state.register.error = false
                state.register.errorMsg = ''
                state.register.successMsg = ''
            })
            .addCase(register.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.register.load = false
                if (code === 500) {
                    state.register.error = true
                    state.register.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.register.successMsg = response.message || 'Account created successfully'
                    state.register.inputs = {
                        firstName: '', lastName: '', email: '', password: '',
                        role: 'student', matricNumber: '', level: '', staffId: '', departmentCode: '',
                    }
                } else {
                    state.register.error = true
                    state.register.errorMsg = response.message || response.msg || 'Registration failed'
                }
            })
            .addCase(register.rejected, (state) => {
                state.register.load = false
                state.register.error = true
                state.register.errorMsg = 'Unable to register'
            })

            // login
            .addCase(login.pending, (state) => {
                state.login.load = true
                state.login.error = false
                state.login.errorMsg = ''
                state.login.successMsg = ''
            })
            .addCase(login.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.login.load = false
                if (code === 500) {
                    state.login.error = true
                    state.login.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.isAuthenticated = true
                    state.login.successMsg = 'Login successful'
                    setTimeout(() => { window.location.href = '/dashboard' }, 300)
                } else {
                    state.login.error = true
                    state.login.errorMsg = response.message || response.msg || 'Invalid credentials'
                }
            })
            .addCase(login.rejected, (state) => {
                state.login.load = false
                state.login.error = true
                state.login.errorMsg = 'Unable to login'
            })

            // logout
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false
                window.location.href = '/login'
            })

            // forgotPassword
            .addCase(forgotPassword.pending, (state) => {
                state.forgotPassword.load = true
                state.forgotPassword.error = false
                state.forgotPassword.sent = false
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.forgotPassword.load = false
                if (code === 500) {
                    state.forgotPassword.error = true
                    state.forgotPassword.message = 'Network error'
                } else if (status === 'success') {
                    state.forgotPassword.sent = true
                    state.forgotPassword.message = response.message || 'Reset link sent'
                } else {
                    state.forgotPassword.error = true
                    state.forgotPassword.message = response.message || 'Failed to send reset link'
                }
            })
            .addCase(forgotPassword.rejected, (state) => {
                state.forgotPassword.load = false
                state.forgotPassword.error = true
                state.forgotPassword.message = 'Unable to send reset link'
            })

            // resetPassword
            .addCase(resetPassword.pending, (state) => {
                state.resetPassword.load = true
                state.resetPassword.error = false
                state.resetPassword.errorMsg = ''
                state.resetPassword.successMsg = ''
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.resetPassword.load = false
                if (code === 500) {
                    state.resetPassword.error = true
                    state.resetPassword.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.resetPassword.successMsg = response.message || 'Password reset successfully'
                } else {
                    state.resetPassword.error = true
                    state.resetPassword.errorMsg = response.message || 'Failed to reset password'
                }
            })
            .addCase(resetPassword.rejected, (state) => {
                state.resetPassword.load = false
                state.resetPassword.error = true
                state.resetPassword.errorMsg = 'Unable to reset password'
            })

            // updatePassword
            .addCase(updatePassword.pending, (state) => {
                state.updatePassword.load = true
                state.updatePassword.error = false
                state.updatePassword.errorMsg = ''
                state.updatePassword.successMsg = ''
            })
            .addCase(updatePassword.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.updatePassword.load = false
                if (code === 500) {
                    state.updatePassword.error = true
                    state.updatePassword.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.updatePassword.successMsg = response.message || 'Password updated'
                    state.updatePassword.inputs = { currentPassword: '', newPassword: '' }
                } else {
                    state.updatePassword.error = true
                    state.updatePassword.errorMsg = response.message || 'Failed to update password'
                }
            })
            .addCase(updatePassword.rejected, (state) => {
                state.updatePassword.load = false
                state.updatePassword.error = true
                state.updatePassword.errorMsg = 'Unable to update password'
            })
    },
})

export default authSlice.reducer
export const {
    fillLoginInputs,
    fillRegisterInputs,
    fillForgotPasswordEmail,
    fillUpdatePasswordInputs,
    clearAuthNotifications,
} = authSlice.actions
