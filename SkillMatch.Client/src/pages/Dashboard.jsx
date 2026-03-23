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
                if (!profileResponse.ok) return;
                const profileData = await profileResponse.json();

                // 2. Fetch real completed assessments from MongoDB
                const userId = user.id || user.email;
                const assessmentResponse = await fetch(`http://127.0.0.1:8000/api/assessment/results?userId=${encodeURIComponent(userId)}`);
                const completedAssessments = assessmentResponse.ok ? await assessmentResponse.json() : [];
                const completedSkillIds = new Set(completedAssessments.map(a => (a.skillId || '').toLowerCase()));

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
                setProfileCompletion(Math.round((completedFields / fields.length) * 100));

                const userSkills = profileData.skills || [];
                const userSkillNames = userSkills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase());

                // --- Generate Recent Activity from real assessment records ---
                const activities = [];

                // Real completions first (from assessments collection)
                completedAssessments.slice(0, 4).forEach(rec => {
                    activities.push({
                        id: rec._id,
                        type: 'assessment',
                        text: `Completed ${rec.skillId} Assessment`,
                        time: rec.completedAt ? new Date(rec.completedAt).toLocaleDateString() : 'Recently',
                        icon: 'check'
                    });
                });

                // Verified skills not already in activity
                userSkills.forEach(s => {
                    const sName = typeof s === 'string' ? s : s.name;
                    if (s.status === 'Verified' && !completedSkillIds.has(sName.toLowerCase())) {
                        activities.push({
                            id: Math.random().toString(),
                            type: 'verification',
                            text: `Verified ${sName} Skill`,
                            time: 'Recently',
                            icon: 'check'
                        });
                    }
                });

                if (activities.length < 2) {
                    activities.push({
                        id: 'welcome',
                        type: 'account',
                        text: 'Joined SkillBridge Platform',
                        time: 'Recently',
                        icon: 'user'
                    });
                }
                setRecentActivity(activities.slice(0, 4));

                // Build a lookup: skillId (lowercase) -> aiScore from real assessment records
                const scoreBySkill = {};
                completedAssessments.forEach(rec => {
                    const key = (rec.skillId || '').toLowerCase();
                    // Keep the highest score if duplicates exist
                    if (!scoreBySkill[key] || rec.aiScore > scoreBySkill[key]) {
                        scoreBySkill[key] = rec.aiScore;
                    }
                });

                const formattedDashboardSkills = userSkills.map(s => {
                    const sName = typeof s === 'string' ? s : s.name;
                    const realScore = scoreBySkill[sName.toLowerCase()];
                    const progress = realScore !== undefined ? realScore : (s.progress ?? 0);
                    return {
                        name: sName,
                        progress,
                        status: s.status || 'Not tested',
                        level: s.level || 'Beginner',
                        assessed: s.status === 'Verified'
                    };
                }).slice(0, 5);
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
                        
                        let matched = 0;
                        if (jobSkillArray.length > 0) {
                            jobSkillArray.forEach(js => {
                                if (userSkillNames.some(us => us.includes(js) || js.includes(us))) matched++;
                            });
                        }
                        
                        const matchPercentage = jobSkillArray.length > 0 
                            ? Math.round((matched / jobSkillArray.length) * 100) 
                            : 0;

                        if (matchPercentage > 0) { totalMatchScore += matchPercentage; countWithScore++; }

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

                    const sortedJobs = formattedJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
                    setDashboardJobs(sortedJobs);
                    
                    const avgScore = countWithScore > 0 ? Math.round(totalMatchScore / countWithScore) : 0;

                    setStats({
                        totalSkills: userSkills.length,
                        assessmentsCompleted: completedAssessments.length,
                        availableJobs: formattedJobs.filter(j => j.matchScore > 20).length,
                        matchingScore: avgScore
                    });
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
