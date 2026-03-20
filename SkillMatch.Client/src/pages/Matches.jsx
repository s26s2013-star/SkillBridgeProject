import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const Matches = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || mockUser;

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>Your Top Matches</h3>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <p>Detailed match analysis is being prepared for you.</p>
                </div>
            </div>
        </DashboardLayout>
    );
};
