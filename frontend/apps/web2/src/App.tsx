import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, LoginPage, ProtectedRoute } from '@repo/auth'
import { Toaster } from '@repo/ui'
import { HomePage } from './pages/HomePage'

/**
 * All routes are protected by default via ProtectedRoute.
 * Only /login is public.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}
