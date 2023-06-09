import React from 'react'
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/Routes'
import { RouteConfig, ROUTE_CONFIG } from '../configs/routes/routeConfig'

export const AppRouter = () => {
  const buildRoutes = () => (
    <Routes>
      {Object.values(ROUTE_CONFIG).map(
        ({
          path,
          component,
          isProtected,
          allowedRoles,
          isProtectedOwnerUser,
        }: RouteConfig) => {
          const element = isProtected ? (
            <ProtectedRoute
              allowedRoles={allowedRoles}
              isProtectedOwnerUser={isProtectedOwnerUser}
            >
              {component}
            </ProtectedRoute>
          ) : (
            component
          )
          return <Route key={path} path={path} element={element} />
        },
      )}
      <Route path='*' element={<Navigate to='/' replace={true} />} />
    </Routes>
  )

  return <Router>{buildRoutes()}</Router>
}
