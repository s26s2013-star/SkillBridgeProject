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
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // 1. Fetch real user profile
                const profileResponse = await fetch(`http://127.0.0.1:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    
                    // --- Calculate Profile Completion ---
                    const fields = [
                        profileData.name && profileData.name !== 'User',
                        profileData.major && profileData.major !== 'Not specified',
                        profileData.experience > 0,
                        profileData.location && profileData.location !== 'Not specified',
                        profileData.job_type && profileData.job_type !== 'Not specified',
                        profileData.skills && profileData.skills.length > 0
                    ];
                    const completedFields = fields.filter(Boolean).length;
                    const completionPercentage = Math.round((completedFields / fields.length) * 100);
                    setProfileCompletion(completionPercentage);

                    const userSkills = profileData.skills || [];
                    const userSkillNames = userSkills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
                    const verifiedCount = userSkills.filter(s => s.status === 'Verified').length;

                    // --- Generate Recent Activity ---
                    const activities = [];
                    userSkills.forEach(s => {
                        const sName = typeof s === 'string' ? s : s.name;
                        if (s.status === 'Verified') {
                            activities.push({
                                id: Math.random().toString(),
                                type: 'verification',
                                text: `Verified ${sName} Skill`,
                                time: 'Recently',
                                icon: 'check'
                            });
                        }
                        if (s.progress > 0 && s.status !== 'Verified') {
                            activities.push({
                                id: Math.random().toString(),
                                type: 'assessment',
                                text: `Started ${sName} Assessment`,
                                time: 'In progress',
                                icon: 'clock'
                            });
                        }
                    });
                    
                    // Add a default "Joined" activity if list is short
                    if (activities.length < 3) {
                        activities.push({
                            id: 'welcome',
                            type: 'account',
                            text: 'Joined SkillBridge Platform',
                            time: 'Recently',
                            icon: 'user'
                        });
                    }
                    setRecentActivity(activities.slice(0, 4));

                    const formattedDashboardSkills = userSkills.map(s => ({
                        name: typeof s === 'string' ? s : s.name,
                        progress: s.progress || 30,
                        status: s.status || 'Pending',
                        level: s.level || 'Beginner',
                        assessed: s.status === 'Verified'
                    })).slice(0, 5);

                    setDashboardSkills(formattedDashboardSkills);
                    
                    // --- Fetch Jobs and Calculate Match Scores ---
                    const industryParam = profileData.major ? `?industry=${encodeURIComponent(profileData.major)}` : '';
                    const jobResponse = await fetch(`http://127.0.0.1:8000/api/jobs${industryParam}`);
                    if (jobResponse.ok) {
                        const data = await jobResponse.json();
                        
                        let totalMatchScore = 0;
                        let countWithScore = 0;

                        const formattedJobs = data.slice(0, 10).map((apiJob) => {
                            const jobSkillString = apiJob.Key_Skills || "";
                            const jobSkillArray = jobSkillString.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
                            
                            // Calculate Real Match Score
                            let matched = 0;
                            if (jobSkillArray.length > 0) {
                                jobSkillArray.forEach(js => {
                                    if (userSkillNames.some(us => us.includes(js) || js.includes(us))) {
                                        matched++;
                                    }
                                });
                            }
                            
                            const matchPercentage = jobSkillArray.length > 0 
                                ? Math.round((matched / jobSkillArray.length) * 100) 
                                : 0;

                            if (matchPercentage > 0) {
                                totalMatchScore += matchPercentage;
                                countWithScore++;
                            }

                            return {
                                id: apiJob._id || Math.random().toString(),
                                title: apiJob.Job_Title || 'Unknown Title',
                                company: apiJob.Company || 'Unknown Company',
                                location: apiJob.Location || 'Remote',
                                matchScore: matchPercentage,
                                skills: jobSkillArray.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                                salary: 'Competitive',
                                posted: 'Recently',
                                missingSkills: jobSkillArray.filter(js => !userSkillNames.some(us => us.includes(js) || js.includes(us)))
                            };
                        });

                        // Filter by highest match first
                        const sortedJobs = formattedJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
                        setDashboardJobs(sortedJobs);
                        
                        const avgScore = countWithScore > 0 ? Math.round(totalMatchScore / countWithScore) : 0;

                        setStats({
                            totalSkills: userSkills.length,
                            assessmentsCompleted: verifiedCount,
                            availableJobs: formattedJobs.filter(j => j.matchScore > 20).length,
                            matchingScore: avgScore
                        });
                    }
                }
            } catch (error) {
                console.error("Dashboard calculation failed:", error);
            }
        };

        if (user.email) {
            fetchUserData();
        }
    }, [user.email]);

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
