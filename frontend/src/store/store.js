import { configureStore } from '@reduxjs/toolkit'
import authSlice from '../slices/authSlice'
import userSlice from '../slices/userSlice'
import courseSlice from '../slices/courseSlice'
import departmentSlice from '../slices/departmentSlice'
import resultSlice from '../slices/resultSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        user: userSlice,
        course: courseSlice,
        department: departmentSlice,
        result: resultSlice,
    },
})
