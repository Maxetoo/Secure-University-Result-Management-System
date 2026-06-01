import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoute = ({ children }) => {
    const { user } = useSelector((store) => store.user)
    const location = useLocation()

    if (user?.role !== 'admin') {
        return <Navigate to='/dashboard' state={{ from: location }} replace />
    }

    return children
}

export default AdminRoute
