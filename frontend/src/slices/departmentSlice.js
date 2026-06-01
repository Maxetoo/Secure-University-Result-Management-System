import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

const initialState = {
    departments: [],
    singleDepartment: {},
    fetchLoad: false,
    fetchError: false,
    singleLoad: false,
    singleError: false,
    createLoad: false,
    createError: false,
    createErrorMsg: '',
    createSuccessMsg: '',
    updateLoad: false,
    updateError: false,
    updateErrorMsg: '',
    updateSuccessMsg: '',
    deleteLoad: false,
    deleteError: false,
    deleteErrorMsg: '',
    deleteSuccessMsg: '',
}

export const fetchDepartments = createAsyncThunk('department/fetchDepartments', async () => {
    try {
        const resp = await api.get('/api/v1/departments/')
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const fetchDepartmentById = createAsyncThunk('department/fetchDepartmentById', async ({ departmentId }) => {
    try {
        const resp = await api.get(`/api/v1/departments/${departmentId}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const createDepartment = createAsyncThunk('department/createDepartment', async ({ name, code, description }) => {
    try {
        const resp = await api.post('/api/v1/departments/', { name, code, description })
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const updateDepartment = createAsyncThunk('department/updateDepartment', async ({ departmentId, ...data }) => {
    try {
        const resp = await api.patch(`/api/v1/departments/${departmentId}`, data)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const deleteDepartment = createAsyncThunk('department/deleteDepartment', async ({ departmentId }) => {
    try {
        const resp = await api.delete(`/api/v1/departments/${departmentId}`)
        return { response: resp.data, status: 'success', departmentId }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {
        clearDepartmentNotifications(state) {
            state.createError = false; state.createErrorMsg = ''; state.createSuccessMsg = ''
            state.updateError = false; state.updateErrorMsg = ''; state.updateSuccessMsg = ''
            state.deleteError = false; state.deleteErrorMsg = ''; state.deleteSuccessMsg = ''
        },
    },
    extraReducers(builder) {
        const ok = (msg, fb) => msg || fb || ''
        builder
            .addCase(fetchDepartments.pending, (s) => { s.fetchLoad = true; s.fetchError = false })
            .addCase(fetchDepartments.fulfilled, (s, a) => {
                s.fetchLoad = false
                if (a.payload.status === 'success') s.departments = a.payload.response.departments || []
                else s.fetchError = true
            })
            .addCase(fetchDepartments.rejected, (s) => { s.fetchLoad = false; s.fetchError = true })

            .addCase(fetchDepartmentById.pending, (s) => { s.singleLoad = true; s.singleError = false })
            .addCase(fetchDepartmentById.fulfilled, (s, a) => {
                s.singleLoad = false
                if (a.payload.status === 'success') s.singleDepartment = a.payload.response.department || {}
                else s.singleError = true
            })
            .addCase(fetchDepartmentById.rejected, (s) => { s.singleLoad = false; s.singleError = true })

            .addCase(createDepartment.pending, (s) => { s.createLoad = true; s.createError = false; s.createErrorMsg = ''; s.createSuccessMsg = '' })
            .addCase(createDepartment.fulfilled, (s, a) => {
                const { status, code, response } = a.payload
                s.createLoad = false
                if (code === 500) { s.createError = true; s.createErrorMsg = 'Network error' }
                else if (status === 'success') { s.createSuccessMsg = ok(response.message, 'Department created'); if (response.department) s.departments.push(response.department) }
                else { s.createError = true; s.createErrorMsg = ok(response.message, 'Failed to create') }
            })
            .addCase(createDepartment.rejected, (s) => { s.createLoad = false; s.createError = true; s.createErrorMsg = 'Network error' })

            .addCase(updateDepartment.pending, (s) => { s.updateLoad = true; s.updateError = false; s.updateErrorMsg = ''; s.updateSuccessMsg = '' })
            .addCase(updateDepartment.fulfilled, (s, a) => {
                const { status, code, response } = a.payload
                s.updateLoad = false
                if (code === 500) { s.updateError = true; s.updateErrorMsg = 'Network error' }
                else if (status === 'success') {
                    s.updateSuccessMsg = ok(response.message, 'Department updated')
                    const d = response.department; if (d) { const i = s.departments.findIndex(x => x._id === d._id); if (i !== -1) s.departments[i] = d }
                } else { s.updateError = true; s.updateErrorMsg = ok(response.message, 'Failed to update') }
            })
            .addCase(updateDepartment.rejected, (s) => { s.updateLoad = false; s.updateError = true; s.updateErrorMsg = 'Network error' })

            .addCase(deleteDepartment.pending, (s) => { s.deleteLoad = true; s.deleteError = false; s.deleteErrorMsg = ''; s.deleteSuccessMsg = '' })
            .addCase(deleteDepartment.fulfilled, (s, a) => {
                const { status, code, response, departmentId } = a.payload
                s.deleteLoad = false
                if (code === 500) { s.deleteError = true; s.deleteErrorMsg = 'Network error' }
                else if (status === 'success') { s.deleteSuccessMsg = ok(response.message, 'Department deleted'); s.departments = s.departments.filter(d => d._id !== departmentId) }
                else { s.deleteError = true; s.deleteErrorMsg = ok(response.message, 'Failed to delete') }
            })
            .addCase(deleteDepartment.rejected, (s) => { s.deleteLoad = false; s.deleteError = true; s.deleteErrorMsg = 'Network error' })
    },
})

export default departmentSlice.reducer
export const { clearDepartmentNotifications } = departmentSlice.actions
