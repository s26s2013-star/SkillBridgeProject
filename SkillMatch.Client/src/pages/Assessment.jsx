import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const Assessment = () => {
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
                    <h3>Skill Assessments</h3>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <p>Assessment module coming soon. Keep practicing!</p>
                </div>
            </div>
        </DashboardLayout>
    );
};
