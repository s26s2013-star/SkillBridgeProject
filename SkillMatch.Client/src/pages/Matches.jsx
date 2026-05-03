import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import JobMatches from '../components/dashboard/JobMatches';

export const Matches = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || {};

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-section p-6">
                <JobMatches email={user?.email} />
            </div>
        </DashboardLayout>
    );
};
