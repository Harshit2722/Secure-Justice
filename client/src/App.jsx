import { Routes, Route } from 'react-router-dom'
import AuthLayout from './components/auth/AuthLayout'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Landing from './pages/Landing'
import PortalLayout from './components/layout/PortalLayout'
import DashboardRouter from './pages/DashboardRouter'

function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Auth Routes with Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Protected Portal Routes */}
      <Route element={<PortalLayout />}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        {/* Placeholder for other navigation items */}
        <Route path="/cases" element={<DashboardRouter />} />
        <Route path="/documents" element={<DashboardRouter />} />
        <Route path="/settings" element={<DashboardRouter />} />
      </Route>
    </Routes>
  )
}

export default App
