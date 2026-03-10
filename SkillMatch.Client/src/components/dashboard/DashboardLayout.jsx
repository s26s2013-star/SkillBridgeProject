import React from 'react';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children, user, onLogout }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar user={user} onLogout={onLogout} />
            <main className="dashboard-main">
                <div className="dashboard-content animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};
