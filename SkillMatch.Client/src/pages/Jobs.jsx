import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const Jobs = () => {
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
                    <h3>Explore Jobs</h3>
                    <div className="search-filter" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Search and filter options coming soon
                    </div>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <p>Job board integration coming soon.</p>
                </div>
            </div>
        </DashboardLayout>
    );
};
