import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

const initialState = {
    user: {},
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isInitialized: false,
    isLoading: false,
    isError: false,
    allUsers: [],
    allUsersLoad: false,
    allUsersError: false,
    lecturers: [],
    lecturersLoad: false,
    students: [],
    studentsLoad: false,
    updateProfile: {
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
    adminEdit: {
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
    adminDelete: {
        load: false,
        error: false,
        errorMsg: '',
    },
}

// GET /api/profile — fetch logged-in user
export const getCurrentUser = createAsyncThunk('user/getCurrentUser', async () => {
    try {
        const resp = await api.get('/api/profile')
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// GET /api/v1/users/profile/:userId
export const fetchProfile = createAsyncThunk('user/fetchProfile', async ({ userId }) => {
    try {
        const resp = await api.get(`/api/v1/users/profile/${userId}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// PATCH /api/v1/users/profile/:userId
export const updateProfile = createAsyncThunk('user/updateProfile', async ({ userId, ...data }) => {
    try {
        const resp = await api.patch(`/api/v1/users/profile/${userId}`, data)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// GET /api/v1/users
export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async (params = {}) => {
    const { role, search, department } = params
    const query = new URLSearchParams()
    if (role) query.append('role', role)
    if (search) query.append('search', search)
    if (department) query.append('department', department)
    try {
        const resp = await api.get(`/api/v1/users/?${query.toString()}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// GET /api/v1/users/lecturers
export const fetchLecturers = createAsyncThunk('user/fetchLecturers', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.departmentId) query.append('departmentId', params.departmentId)
    try {
        const resp = await api.get(`/api/v1/users/lecturers?${query.toString()}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// PATCH /api/v1/users/:userId/admin-edit
export const adminEditUser = createAsyncThunk('user/adminEditUser', async ({ userId, ...data }) => {
    try {
        const resp = await api.patch(`/api/v1/users/${userId}/admin-edit`, data)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// DELETE /api/v1/users/:userId/delete
export const deleteUser = createAsyncThunk('user/deleteUser', async ({ userId }) => {
    try {
        const resp = await api.delete(`/api/v1/users/${userId}/delete`)
        return { response: resp.data, status: 'success', userId }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// GET /api/v1/users/students
export const fetchStudents = createAsyncThunk('user/fetchStudents', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.departmentId) query.append('departmentId', params.departmentId)
    if (params.level) query.append('level', params.level)
    try {
        const resp = await api.get(`/api/v1/users/students?${query.toString()}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setInitialized(state) {
            state.isInitialized = true
        },
        clearUserNotifications(state) {
            state.updateProfile.error = false
            state.updateProfile.errorMsg = ''
            state.updateProfile.successMsg = ''
        },
        clearAdminNotifications(state) {
            state.adminEdit.error = false
            state.adminEdit.errorMsg = ''
            state.adminEdit.successMsg = ''
            state.adminDelete.error = false
            state.adminDelete.errorMsg = ''
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                const { status, response } = action.payload
                state.isLoading = false
                state.isInitialized = true
                if (status === 'success') {
                    state.user = response.user || {}
                    state.isAuthenticated = true
                } else {
                    state.isError = true
                    state.isAuthenticated = false
                }
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.isLoading = false
                state.isInitialized = true
                state.isError = true
                state.isAuthenticated = false
            })

            .addCase(fetchProfile.fulfilled, (state, action) => {
                const { status, response } = action.payload
                if (status === 'success') {
                    state.user = response.user || {}
                }
            })

            .addCase(updateProfile.pending, (state) => {
                state.updateProfile.load = true
                state.updateProfile.error = false
                state.updateProfile.errorMsg = ''
                state.updateProfile.successMsg = ''
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.updateProfile.load = false
                if (code === 500) {
                    state.updateProfile.error = true
                    state.updateProfile.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.updateProfile.successMsg = response.message || 'Profile updated'
                    state.user = response.user || state.user
                } else {
                    state.updateProfile.error = true
                    state.updateProfile.errorMsg = response.message || 'Failed to update profile'
                }
            })
            .addCase(updateProfile.rejected, (state) => {
                state.updateProfile.load = false
                state.updateProfile.error = true
                state.updateProfile.errorMsg = 'Network error'
            })

            .addCase(fetchAllUsers.pending, (state) => {
                state.allUsersLoad = true
                state.allUsersError = false
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                const { status, response } = action.payload
                state.allUsersLoad = false
                if (status === 'success') {
                    state.allUsers = response.users || []
                } else {
                    state.allUsersError = true
                }
            })
            .addCase(fetchAllUsers.rejected, (state) => {
                state.allUsersLoad = false
                state.allUsersError = true
            })

            .addCase(fetchLecturers.pending, (state) => { state.lecturersLoad = true })
            .addCase(fetchLecturers.fulfilled, (state, action) => {
                state.lecturersLoad = false
                if (action.payload.status === 'success') {
                    state.lecturers = action.payload.response.lecturers || []
                }
            })
            .addCase(fetchLecturers.rejected, (state) => { state.lecturersLoad = false })

            .addCase(fetchStudents.pending, (state) => { state.studentsLoad = true })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.studentsLoad = false
                if (action.payload.status === 'success') {
                    state.students = action.payload.response.students || []
                }
            })
            .addCase(fetchStudents.rejected, (state) => { state.studentsLoad = false })

            .addCase(adminEditUser.pending, (state) => {
                state.adminEdit.load = true
                state.adminEdit.error = false
                state.adminEdit.errorMsg = ''
                state.adminEdit.successMsg = ''
            })
            .addCase(adminEditUser.fulfilled, (state, action) => {
                state.adminEdit.load = false
                const { status, response } = action.payload
                if (status === 'success') {
                    state.adminEdit.successMsg = response.message || 'User updated'
                    const updated = response.user
                    state.allUsers = state.allUsers.map((u) => u._id === updated._id ? updated : u)
                } else {
                    state.adminEdit.error = true
                    state.adminEdit.errorMsg = response.message || 'Failed to update user'
                }
            })
            .addCase(adminEditUser.rejected, (state) => {
                state.adminEdit.load = false
                state.adminEdit.error = true
                state.adminEdit.errorMsg = 'Network error'
            })

            .addCase(deleteUser.pending, (state) => {
                state.adminDelete.load = true
                state.adminDelete.error = false
                state.adminDelete.errorMsg = ''
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.adminDelete.load = false
                const { status, response, userId } = action.payload
                if (status === 'success') {
                    state.allUsers = state.allUsers.filter((u) => u._id !== userId)
                } else {
                    state.adminDelete.error = true
                    state.adminDelete.errorMsg = response.message || 'Failed to delete user'
                }
            })
            .addCase(deleteUser.rejected, (state) => {
                state.adminDelete.load = false
                state.adminDelete.error = true
                state.adminDelete.errorMsg = 'Network error'
            })
    },
})

export default userSlice.reducer
export const { setInitialized, clearUserNotifications, clearAdminNotifications } = userSlice.actions
