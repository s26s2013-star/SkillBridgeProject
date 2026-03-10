import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { mockUser } from '../data/mockDashboardData';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const Profile = () => {
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
                    <h3>Your Profile</h3>
                    <button className="view-all" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Edit Profile</button>
                </div>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="dashboard-card" style={{ flex: '1', minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user?.name || 'Alex Johnson'}</h4>
                                <p style={{ color: 'var(--color-text-muted)' }}>{user?.role || 'Student'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ fontWeight: '500' }}>Email</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>{user?.email || 'alex@example.com'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ fontWeight: '500' }}>Location</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>{user?.location || 'Remote'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
