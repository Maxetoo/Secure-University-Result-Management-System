import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

const initialState = {
    courses: [],
    singleCourse: {},
    lecturerCourses: [],
    fetchLoad: false,
    fetchError: false,
    singleLoad: false,
    singleError: false,
    lecturerCoursesLoad: false,
    lecturerCoursesError: false,
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
    assignLoad: false,
    assignError: false,
    assignErrorMsg: '',
    assignSuccessMsg: '',
}

export const fetchCourses = createAsyncThunk('course/fetchCourses', async () => {
    try {
        const resp = await api.get('/api/v1/courses/')
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const fetchCourseById = createAsyncThunk('course/fetchCourseById', async ({ courseId }) => {
    try {
        const resp = await api.get(`/api/v1/courses/${courseId}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const createCourse = createAsyncThunk('course/createCourse', async (payload) => {
    const { courseCode, title, departmentCode, level } = payload
    try {
        const resp = await api.post('/api/v1/courses/', { courseCode, title, departmentCode, level })
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const updateCourse = createAsyncThunk('course/updateCourse', async ({ courseId, ...data }) => {
    try {
        const resp = await api.patch(`/api/v1/courses/${courseId}`, data)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const deleteCourse = createAsyncThunk('course/deleteCourse', async ({ courseId }) => {
    try {
        const resp = await api.delete(`/api/v1/courses/${courseId}`)
        return { response: resp.data, status: 'success', courseId }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const assignLecturer = createAsyncThunk('course/assignLecturer', async ({ courseId, lecturerId }) => {
    try {
        const resp = await api.patch(`/api/v1/courses/${courseId}/assign-lecturer`, { lecturerId })
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

export const fetchLecturerCourses = createAsyncThunk('course/fetchLecturerCourses', async ({ lecturerId }) => {
    try {
        const resp = await api.get(`/api/v1/courses/lecturer/${lecturerId}`)
        return { response: resp.data, status: 'success' }
    } catch (error) {
        return { response: error.response?.data || { message: 'Network error' }, status: 'error', code: error.response?.status || 500 }
    }
})

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        clearCourseNotifications(state) {
            state.createError = false; state.createErrorMsg = ''; state.createSuccessMsg = ''
            state.updateError = false; state.updateErrorMsg = ''; state.updateSuccessMsg = ''
            state.deleteError = false; state.deleteErrorMsg = ''; state.deleteSuccessMsg = ''
            state.assignError = false; state.assignErrorMsg = ''; state.assignSuccessMsg = ''
        },
    },
    extraReducers(builder) {
        const ok = (msg, fb) => msg || fb || ''
        builder
            .addCase(fetchCourses.pending, (s) => { s.fetchLoad = true; s.fetchError = false })
            .addCase(fetchCourses.fulfilled, (s, a) => {
                s.fetchLoad = false
                if (a.payload.status === 'success') s.courses = a.payload.response.courses || []
                else s.fetchError = true
            })
            .addCase(fetchCourses.rejected, (s) => { s.fetchLoad = false; s.fetchError = true })

            .addCase(fetchCourseById.pending, (s) => { s.singleLoad = true; s.singleError = false })
            .addCase(fetchCourseById.fulfilled, (s, a) => {
                s.singleLoad = false
                if (a.payload.status === 'success') s.singleCourse = a.payload.response.course || {}
                else s.singleError = true
            })
            .addCase(fetchCourseById.rejected, (s) => { s.singleLoad = false; s.singleError = true })

            .addCase(createCourse.pending, (s) => { s.createLoad = true; s.createError = false; s.createErrorMsg = ''; s.createSuccessMsg = '' })
            .addCase(createCourse.fulfilled, (s, a) => {
                const { status, code, response } = a.payload
                s.createLoad = false
                if (code === 500) { s.createError = true; s.createErrorMsg = 'Network error' }
                else if (status === 'success') { s.createSuccessMsg = ok(response.message, 'Course created'); if (response.course) s.courses.push(response.course) }
                else { s.createError = true; s.createErrorMsg = ok(response.message, 'Failed to create course') }
            })
            .addCase(createCourse.rejected, (s) => { s.createLoad = false; s.createError = true; s.createErrorMsg = 'Network error' })

            .addCase(updateCourse.pending, (s) => { s.updateLoad = true; s.updateError = false; s.updateErrorMsg = ''; s.updateSuccessMsg = '' })
            .addCase(updateCourse.fulfilled, (s, a) => {
                const { status, code, response } = a.payload
                s.updateLoad = false
                if (code === 500) { s.updateError = true; s.updateErrorMsg = 'Network error' }
                else if (status === 'success') {
                    s.updateSuccessMsg = ok(response.message, 'Course updated')
                    const updated = response.course
                    if (updated) { const i = s.courses.findIndex(c => c._id === updated._id); if (i !== -1) s.courses[i] = updated }
                } else { s.updateError = true; s.updateErrorMsg = ok(response.message, 'Failed to update') }
            })
            .addCase(updateCourse.rejected, (s) => { s.updateLoad = false; s.updateError = true; s.updateErrorMsg = 'Network error' })

            .addCase(deleteCourse.pending, (s) => { s.deleteLoad = true; s.deleteError = false; s.deleteErrorMsg = ''; s.deleteSuccessMsg = '' })
            .addCase(deleteCourse.fulfilled, (s, a) => {
                const { status, code, response, courseId } = a.payload
                s.deleteLoad = false
                if (code === 500) { s.deleteError = true; s.deleteErrorMsg = 'Network error' }
                else if (status === 'success') { s.deleteSuccessMsg = ok(response.message, 'Course deleted'); s.courses = s.courses.filter(c => c._id !== courseId) }
                else { s.deleteError = true; s.deleteErrorMsg = ok(response.message, 'Failed to delete') }
            })
            .addCase(deleteCourse.rejected, (s) => { s.deleteLoad = false; s.deleteError = true; s.deleteErrorMsg = 'Network error' })

            .addCase(assignLecturer.pending, (s) => { s.assignLoad = true; s.assignError = false; s.assignErrorMsg = ''; s.assignSuccessMsg = '' })
            .addCase(assignLecturer.fulfilled, (s, a) => {
                const { status, code, response } = a.payload
                s.assignLoad = false
                if (code === 500) { s.assignError = true; s.assignErrorMsg = 'Network error' }
                else if (status === 'success') {
                    s.assignSuccessMsg = ok(response.message, 'Lecturer assigned')
                    const updated = response.course
                    if (updated) { const i = s.courses.findIndex(c => c._id === updated._id); if (i !== -1) s.courses[i] = updated }
                } else { s.assignError = true; s.assignErrorMsg = ok(response.message, 'Failed to assign') }
            })
            .addCase(assignLecturer.rejected, (s) => { s.assignLoad = false; s.assignError = true; s.assignErrorMsg = 'Network error' })

            .addCase(fetchLecturerCourses.pending, (s) => { s.lecturerCoursesLoad = true; s.lecturerCoursesError = false })
            .addCase(fetchLecturerCourses.fulfilled, (s, a) => {
                s.lecturerCoursesLoad = false
                if (a.payload.status === 'success') s.lecturerCourses = a.payload.response.courses || []
                else s.lecturerCoursesError = true
            })
            .addCase(fetchLecturerCourses.rejected, (s) => { s.lecturerCoursesLoad = false; s.lecturerCoursesError = true })
    },
})

export default courseSlice.reducer
export const { clearCourseNotifications } = courseSlice.actions
