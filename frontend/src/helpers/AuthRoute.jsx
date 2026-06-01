import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AuthRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((store) => store.user)
  const location = useLocation()

  if (!isInitialized) return null

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return children
}

export default AuthRoute
