import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { EntryProvider } from './context/EntryContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop'; // ✅ Add this import

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';

// Entry Pages
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/entries/EntryForm';
import EntryList from './pages/entries/EntryList';
import EntryDetail from './pages/entries/EntryDetail';
import Home from './pages/Home';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Routing
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EntryProvider>
          <Router>
            <ScrollToTop /> 
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                  {/* Private Routes */}
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                  {/* Entry Routes */}
                  <Route path="/entries" element={<PrivateRoute><EntryList /></PrivateRoute>} />
                  <Route path="/entries/new" element={<PrivateRoute><EntryForm /></PrivateRoute>} />
                  <Route path="/entries/:id" element={<PrivateRoute><EntryDetail /></PrivateRoute>} />
                  <Route path="/entries/edit/:id" element={<PrivateRoute><EntryForm /></PrivateRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                  {/* Redirect any unknown routes to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </EntryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
