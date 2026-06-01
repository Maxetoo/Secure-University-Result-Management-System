import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import styled from 'styled-components'
import { ScrollToTop, AuthRoute, HomeRedirectRoute, AdminRoute } from './helpers'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, AuthCallbackPage, ErrorPage } from './pages'
import DashboardLayout from './components/dashboard/DashboardLayout'
import {
    DashboardPage,
    CoursesPage,
    AnnouncementsPage,
    DepartmentsPage,
    UsersPage,
    ProfileSettingsPage,
    AccountSettingsPage,
    ResultsPage,
    UploadResultsPage,
    ResultsManagePage,
} from './pages/dashboard'
import { getCurrentUser, setInitialized } from './slices/userSlice'

const App = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (localStorage.getItem('accessToken') || localStorage.getItem('refreshToken')) {
            dispatch(getCurrentUser())
        } else {
            dispatch(setInitialized())
        }
    }, [dispatch])

    return (
        <Wrapper>
            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
                <Route path="/" element={<HomeRedirectRoute><LoginPage /></HomeRedirectRoute>} />
                <Route path="/login" element={<HomeRedirectRoute><LoginPage /></HomeRedirectRoute>} />
                <Route path="/register" element={<HomeRedirectRoute><SignupPage /></HomeRedirectRoute>} />
                <Route path="/forgot-password" element={<HomeRedirectRoute><ForgotPasswordPage /></HomeRedirectRoute>} />
                <Route path="/reset-password" element={<HomeRedirectRoute><ResetPasswordPage /></HomeRedirectRoute>} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                <Route path="/dashboard" element={<AuthRoute><DashboardLayout /></AuthRoute>}>
                    <Route index element={<DashboardPage />} />

                    {/* Results — role-gated inside components */}
                    <Route path="results" element={<ResultsPage />} />
                    <Route path="results/upload" element={<UploadResultsPage />} />
                    <Route path="results/manage" element={<ResultsManagePage />} />

                    {/* Courses & Departments */}
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="departments" element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
                    <Route path="users" element={<UsersPage />} />

                    {/* Settings */}
                    <Route path="settings/profile" element={<ProfileSettingsPage />} />
                    <Route path="settings/account" element={<AccountSettingsPage />} />
                </Route>

                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </Wrapper>
    )
}

const Wrapper = styled.main`
    position: relative;
    width: 100vw;
    height: auto;
`

export default App
