import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { mockUser } from '../data/mockDashboardData';

// Components
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SkillProgressCard } from '../components/dashboard/SkillProgressCard';
import { JobMatchCard } from '../components/dashboard/JobMatchCard';
import { ProfileCompletionCard } from '../components/dashboard/ProfileCompletionCard';

export const Dashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || mockUser;

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-grid">
                {/* Main Column */}
                <div className="dashboard-main-col">
                    <WelcomeBanner userName={user.name?.split(' ')[0] || 'Student'} />
                    <SummaryCards stats={mockUser.stats} />
                    <JobMatchCard jobs={mockUser.recommendedJobs} />
                </div>

                {/* Side Column */}
                <div className="dashboard-side-col">
                    <ProfileCompletionCard
                        completion={mockUser.profileCompletion}
                        recentActivity={mockUser.recentActivity}
                    />
                    <SkillProgressCard skills={mockUser.topSkills} />
                </div>
            </div>
        </DashboardLayout>
    );
};
