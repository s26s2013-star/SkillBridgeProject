import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export const ProtectedRoute = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};