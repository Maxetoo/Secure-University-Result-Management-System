import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

const initialState = {
    // Student: own results
    myResults: [],
    myResultsLoad: false,
    myResultsError: false,

    // Admin: all results
    allResults: [],
    allResultsLoad: false,
    allResultsError: false,

    // Lecturer/admin: specific student results
    studentResults: [],
    studentResultsLoad: false,

    // Upload / edit state
    upload: {
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
    edit: {
        load: false,
        error: false,
        errorMsg: '',
        successMsg: '',
    },
}

// GET /api/v1/results/my  — student
export const fetchMyResults = createAsyncThunk('result/fetchMyResults', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.semester) query.append('semester', params.semester)
    if (params.academicYear) query.append('academicYear', params.academicYear)
    try {
        const resp = await api.get(`/api/v1/results/my?${query.toString()}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// GET /api/v1/results  — admin
export const fetchAllResults = createAsyncThunk('result/fetchAllResults', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.studentId) query.append('studentId', params.studentId)
    if (params.courseId) query.append('courseId', params.courseId)
    if (params.semester) query.append('semester', params.semester)
    if (params.academicYear) query.append('academicYear', params.academicYear)
    if (params.search) query.append('search', params.search)
    try {
        const resp = await api.get(`/api/v1/results?${query.toString()}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// GET /api/v1/results/student/:studentId  — lecturer/admin
export const fetchStudentResults = createAsyncThunk('result/fetchStudentResults', async ({ studentId }) => {
    try {
        const resp = await api.get(`/api/v1/results/student/${studentId}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// POST /api/v1/results  — lecturer uploads result (with optional FormData document)
export const uploadResult = createAsyncThunk('result/uploadResult', async (payload) => {
    try {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                formData.append(key, val)
            }
        })
        const resp = await api.post('/api/v1/results', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// PATCH /api/v1/results/:id  — lecturer edits result
export const editResult = createAsyncThunk('result/editResult', async ({ id, ...payload }) => {
    try {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                formData.append(key, val)
            }
        })
        const resp = await api.patch(`/api/v1/results/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

// DELETE /api/v1/results/:id  — admin
export const deleteResult = createAsyncThunk('result/deleteResult', async ({ id }) => {
    try {
        const resp = await api.delete(`/api/v1/results/${id}`)
        return { response: resp.data, status: 'success', id }
    } catch (error) {
        return {
            response: error.response?.data || { message: 'Network error' },
            status: 'error',
            code: error.response?.status || 500,
        }
    }
})

const resultSlice = createSlice({
    name: 'result',
    initialState,
    reducers: {
        clearResultNotifications(state) {
            state.upload.error = false
            state.upload.errorMsg = ''
            state.upload.successMsg = ''
            state.edit.error = false
            state.edit.errorMsg = ''
            state.edit.successMsg = ''
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchMyResults.pending, (state) => {
                state.myResultsLoad = true
                state.myResultsError = false
            })
            .addCase(fetchMyResults.fulfilled, (state, action) => {
                state.myResultsLoad = false
                if (action.payload.status === 'success') {
                    state.myResults = action.payload.response.results || []
                    state.myResultsError = false
                } else {
                    state.myResultsError = true
                }
            })
            .addCase(fetchMyResults.rejected, (state) => {
                state.myResultsLoad = false
                state.myResultsError = true
            })

            .addCase(fetchAllResults.pending, (state) => {
                state.allResultsLoad = true
                state.allResultsError = false
            })
            .addCase(fetchAllResults.fulfilled, (state, action) => {
                state.allResultsLoad = false
                if (action.payload.status === 'success') {
                    state.allResults = action.payload.response.results || []
                } else {
                    state.allResultsError = true
                }
            })
            .addCase(fetchAllResults.rejected, (state) => {
                state.allResultsLoad = false
                state.allResultsError = true
            })

            .addCase(fetchStudentResults.pending, (state) => { state.studentResultsLoad = true })
            .addCase(fetchStudentResults.fulfilled, (state, action) => {
                state.studentResultsLoad = false
                if (action.payload.status === 'success') {
                    state.studentResults = action.payload.response.results || []
                }
            })
            .addCase(fetchStudentResults.rejected, (state) => { state.studentResultsLoad = false })

            .addCase(uploadResult.pending, (state) => {
                state.upload.load = true
                state.upload.error = false
                state.upload.errorMsg = ''
                state.upload.successMsg = ''
            })
            .addCase(uploadResult.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.upload.load = false
                if (code === 500) {
                    state.upload.error = true
                    state.upload.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.upload.successMsg = response.message || 'Result uploaded successfully'
                } else {
                    state.upload.error = true
                    state.upload.errorMsg = response.message || response.msg || 'Upload failed'
                }
            })
            .addCase(uploadResult.rejected, (state) => {
                state.upload.load = false
                state.upload.error = true
                state.upload.errorMsg = 'Upload failed'
            })

            .addCase(editResult.pending, (state) => {
                state.edit.load = true
                state.edit.error = false
                state.edit.errorMsg = ''
                state.edit.successMsg = ''
            })
            .addCase(editResult.fulfilled, (state, action) => {
                const { status, code, response } = action.payload
                state.edit.load = false
                if (code === 500) {
                    state.edit.error = true
                    state.edit.errorMsg = 'Network error'
                } else if (status === 'success') {
                    state.edit.successMsg = response.message || 'Result updated'
                    // Update in-place in allResults if present
                    const updated = response.result
                    const idx = state.allResults.findIndex((r) => r._id === updated._id)
                    if (idx !== -1) state.allResults[idx] = updated
                } else {
                    state.edit.error = true
                    state.edit.errorMsg = response.message || 'Failed to update result'
                }
            })
            .addCase(editResult.rejected, (state) => {
                state.edit.load = false
                state.edit.error = true
                state.edit.errorMsg = 'Network error'
            })

            .addCase(deleteResult.fulfilled, (state, action) => {
                if (action.payload.status === 'success') {
                    state.allResults = state.allResults.filter((r) => r._id !== action.payload.id)
                }
            })
    },
})

export default resultSlice.reducer
export const { clearResultNotifications } = resultSlice.actions
