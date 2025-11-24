import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CalculatorProvider } from './contexts/CalculatorContext';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import GoldCalculator from './components/GoldCalculator';
import Billing from './pages/Billing';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import UserVault from './pages/UserVault';
import LoginSignup from './components/LoginSignup';

const PublicRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  return user && (user.role === 'employee' || user.role === 'admin') ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" />
  );
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  return user?.role === 'admin' ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <CalculatorProvider>
          <Routes>
            <Route path="/login" element={<LoginSignup />} />
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/" element={<PublicRoute />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="calculator" element={<GoldCalculator />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/" element={<EmployeeRoute />}>
              <Route path="billing" element={<Billing />} />
              <Route path="user-dashboard" element={<UserDashboard />} />
              <Route path="user-vault" element={<UserVault />} />
            </Route>
          </Routes>
        </CalculatorProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
