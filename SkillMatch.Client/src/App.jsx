import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Skills } from './pages/Skills';
import { Assessment } from './pages/Assessment';
import { Jobs } from './pages/Jobs';
import { Matches } from './pages/Matches';
import { Profile } from './pages/Profile';
import { AuthLayout } from './components/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <AuthLayout
            title="Welcome back"
            subtitle="Please enter your details to sign in."
          >
            <Login />
          </AuthLayout>
        }
      />

      <Route
        path="/register"
        element={
          <AuthLayout
            title="Create an account"
            subtitle="Start your journey with SkillsBridge today."
          >
            <Register />
          </AuthLayout>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;