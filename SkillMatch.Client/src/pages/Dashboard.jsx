import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Components
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SkillProgressCard } from '../components/dashboard/SkillProgressCard';
import { JobMatchCard } from '../components/dashboard/JobMatchCard';
import { ProfileCompletionCard } from '../components/dashboard/ProfileCompletionCard';

export const Dashboard = () => {
    const navigate = useNavigate();
    // Get real user from localStorage
    const user = authService.getCurrentUser() || {};

    const [dashboardSkills, setDashboardSkills] = useState([]);
    const [dashboardJobs, setDashboardJobs] = useState([]);
    
    // Real data initialization
    const [stats, setStats] = useState({
        totalSkills: 0,
        assessmentsCompleted: 0,
        matchingScore: 0,
        availableJobs: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [profileCompletion, setProfileCompletion] = useState(25);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                // Use major to fetch relevant initial skills
                const majorParam = user.major ? `?major=${encodeURIComponent(user.major)}` : '';
                const response = await fetch(`http://127.0.0.1:8000/api/skills${majorParam}`);
                if (response.ok) {
                    const data = await response.json();
                    const formattedSkills = data.slice(0, 5).map((apiSkill, index) => ({
                        name: apiSkill.skill_name,
                        progress: index === 0 ? 85 : index === 1 ? 65 : 40,
                        assessed: index === 0,
                        status: index === 0 ? 'Verified' : 'Pending',
                        level: index === 0 ? 'Advanced' : 'Beginner'
                    }));
                    setDashboardSkills(formattedSkills);
                    
                    // Update stats
                    setStats(prev => ({
                        ...prev,
                        totalSkills: formattedSkills.length,
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch skills for dashboard:", error);
            }
        };

        const fetchJobs = async () => {
            try {
                // Fetch relevant jobs via industry mapped mostly by major or keywords
                const industryParam = user.major ? `?industry=${encodeURIComponent(user.major)}` : '';
                const response = await fetch(`http://127.0.0.1:8000/api/jobs${industryParam}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Map the top 4 jobs to the JobMatchCard format
                    const formattedJobs = data.slice(0, 4).map((apiJob) => {
                        // Safely parse skills string into an array, fallback to empty array if missing
                        const skillArray = apiJob.Key_Skills 
                            ? apiJob.Key_Skills.split(',').map(s => s.trim()).slice(0, 3) 
                            : [];
                            
                        return {
                            id: apiJob._id || Math.random().toString(),
                            title: apiJob.Job_Title || 'Unknown Title',
                            company: apiJob.Company || 'Unknown Company',
                            location: apiJob.Location || 'Remote',
                            matchScore: Math.floor(Math.random() * 15) + 85, // Fake score for UI consistency
                            skills: skillArray,
                            salary: 'Competitive',
                            posted: 'Recently',
                            missingSkills: []
                        };
                    });
                        
                    setDashboardJobs(formattedJobs);
                    
                    setStats(prev => ({
                        ...prev,
                        availableJobs: formattedJobs.length,
                        matchingScore: formattedJobs.length > 0 ? 88 : 0
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch jobs for dashboard:", error);
            }
        };

        fetchSkills();
        fetchJobs();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-grid">
                {/* Main Column */}
                <div className="dashboard-main-col">
                    <WelcomeBanner userName={user.name?.split(' ')[0] || 'User'} />
                    <SummaryCards stats={stats} />
                    <JobMatchCard jobs={dashboardJobs} hasSkills={dashboardSkills.length > 0 && stats.assessmentsCompleted > -1} />
                </div>

                {/* Side Column */}
                <div className="dashboard-side-col">
                    <ProfileCompletionCard
                        completion={profileCompletion}
                        recentActivity={recentActivity}
                    />
                    <SkillProgressCard skills={dashboardSkills} />
                </div>
            </div>
        </DashboardLayout>
    );
};
