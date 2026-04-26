import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/auth/AuthLayout';
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './pages/VerifyEmail';
import PortalLayout from './components/layout/PortalLayout';
import MyCases from './pages/MyCases';
import Settings from './pages/Settings';
import CitizenPortal from './pages/CitizenPortal';
import FirDetails from './pages/FirDetails';
import Documents from './pages/Documents';
import EvidenceDetails from './pages/EvidenceDetails';
import PolicePortal from './pages/PolicePortal';
import PoliceActiveCases from './pages/PoliceActiveCases';
import YourCases from './pages/YourCases';
import ForensicPortal from './pages/ForensicPortal';
import ForensicActiveCases from './pages/ForensicActiveCases';
import ForensicYourCases from './pages/ForensicYourCases';
import AdminDashboard from './pages/AdminDashboard';
import AdminAssignments from './pages/AdminAssignments';
import AdminUsers from './pages/AdminUsers';
import UserDetails from './pages/UserDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes with Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Email Verification Route */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Protected Portal Routes */}
      <Route element={<PortalLayout />}>
        <Route path="/dashboard" element={<CitizenPortal />} />
        <Route path="/police-dashboard" element={<PolicePortal />} />
        <Route path="/cases" element={<MyCases />} />
        <Route path="/active-cases" element={<PoliceActiveCases />} />
        <Route path="/your-cases" element={<YourCases />} />
        <Route path="/cases/:id" element={<FirDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:firId" element={<EvidenceDetails />} />
        <Route path="/forensics" element={<ForensicPortal />} />
        <Route path="/forensic-active-cases" element={<ForensicActiveCases />} />
        <Route path="/forensic-your-cases" element={<ForensicYourCases />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-assignments" element={<AdminAssignments />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-users/:id" element={<UserDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
