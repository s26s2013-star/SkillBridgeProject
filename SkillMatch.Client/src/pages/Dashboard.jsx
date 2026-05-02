import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/api';
import heroImage from "../assets/dashboard-hero.png";
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SkillProgressCard } from '../components/dashboard/SkillProgressCard';
import { ProfileCompletionCard } from '../components/dashboard/ProfileCompletionCard';
import { Button } from '../components/Button';
import {
    TrendingUp,
    Briefcase,
    Award,
    Users,
    ArrowRight,
    Zap,
    RefreshCcw,
    CheckCircle2,
    Clock,
    Target,
    Activity,
    ExternalLink,
    Bell,
    ChevronRight,
    Search,
    LayoutDashboard,
    GraduationCap,
    Heart,
    UserCircle,
    LogOut,
    FileText,
    BarChart3,
    Shield
} from 'lucide-react';

export const Dashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || {};

    const [dashboardSkills, setDashboardSkills] = useState([]);
    const [stats, setStats] = useState({
        totalSkills: 0,
        assessmentsCompleted: 0,
        matchingScore: 0,
        availableJobs: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [profileCompletion, setProfileCompletion] = useState(50);

    // Market Data State
    const [marketData, setMarketData] = useState(null);
    const [marketLoading, setMarketLoading] = useState(true);
    const [marketError, setMarketError] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(user.email)}`);
                if (!profileResponse.ok) return;
                const profileData = await profileResponse.json();

                const userId = user.id || user.email;
                const assessmentResponse = await fetch(`${API_BASE_URL}/api/assessment/results?userId=${encodeURIComponent(userId)}`);
                const completedAssessments = assessmentResponse.ok ? await assessmentResponse.json() : [];

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

                const activities = [];
                completedAssessments.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 3).forEach(rec => {
                    activities.push({
                        id: rec._id,
                        type: 'assessment',
                        text: `Completed ${rec.skillId} Assessment`,
                        time: rec.completedAt ? new Date(rec.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently',
                        icon: 'check'
                    });
                });

                if (activities.length < 3) {
                    activities.push({
                        id: 'verification-1',
                        type: 'verification',
                        text: 'Verified Backend Development Skill',
                        time: 'Recently',
                        icon: 'shield'
                    });
                    activities.push({
                        id: 'verification-2',
                        type: 'verification',
                        text: 'Verified Scalability Concepts Skill',
                        time: 'Recently',
                        icon: 'shield'
                    });
                }
                setRecentActivity(activities.slice(0, 3));

                setStats({
                    totalSkills: userSkills.length,
                    assessmentsCompleted: completedAssessments.length,
                    availableJobs: 0,
                    matchingScore: 17
                });

            } catch (error) {
                console.error("Dashboard data sync failed:", error);
            }
        };

        const fetchMarketData = async () => {
            try {
                setMarketLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/market/top-skills`);
                if (!res.ok) throw new Error("API failed");
                const data = await res.json();
                setMarketData(data);
            } catch (err) {
                setMarketError(true);
            } finally {
                setMarketLoading(false);
            }
        };

        if (user.email) {
            fetchUserData();
            fetchMarketData();
        }
    }, [user?.email]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const maxDemand = marketData?.top_skills?.[0]?.demand_count || 1;

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-container">
                {/* PAGE HEADER */}
                <header className="page-header">
                    <div className="header-greeting">
                        <h2>Good morning, {user.name?.split(' ')[0] || 'Nusayba'}! 👋</h2>
                        <p>Track your skills, grow your expertise and unlock better opportunities.</p>
                    </div>
                    <div className="header-tools">
                        <button className="tool-btn"><Bell size={20} /></button>
                        <div className="user-avatar-mini">{user.name?.charAt(0) || 'N'}</div>
                    </div>
                </header>

                <div className="dashboard-content-layout">
                    {/* LEFT MAIN COLUMN */}
                    <div className="content-main">

                        {/* HERO BANNER */}
                        <section className="hero-banner">
                            <div className="hero-overlay-circle circle-lg"></div>
                            <div className="hero-overlay-circle circle-sm"></div>

                            <div className="hero-left">
                                <h2>Start your journey</h2>
                                <p>Assess your skills, discover your strengths, and find the right opportunities for your future.</p>
                                <div className="hero-cta">
                                    <Button onClick={() => navigate('/assessment')} className="btn-hero-primary">
                                        <TrendingUp size={18} /> Start Assessment
                                    </Button>
                                    <Button variant="outline" onClick={() => navigate('/jobs')} className="btn-hero-secondary">
                                        <Briefcase size={18} /> Explore Jobs
                                    </Button>
                                </div>
                            </div>

                            <div className="hero-right">
                                <img
                                    src={heroImage}
                                    alt="Dashboard analytics illustration"
                                    style={{
                                        width: '280px',
                                        objectFit: 'contain'
                                    }}
                                />                            </div>
                        </section>

                        {/* STATS ROW */}
                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-icon"><Award size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.totalSkills}</span>
                                    <span className="stat-label">Total Skills Added</span>
                                    <span className="stat-hint">Keep building!</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Target size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.assessmentsCompleted}</span>
                                    <span className="stat-label">Assessments Completed</span>
                                    <span className="stat-hint">Keep going!</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Activity size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.matchingScore}%</span>
                                    <span className="stat-label">Matching Score</span>
                                    <span className="stat-hint">Good start!</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Briefcase size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{stats.availableJobs}</span>
                                    <span className="stat-label">Job Matches Available</span>
                                    <span className="stat-hint">Complete more skills</span>
                                </div>
                            </div>
                        </div>

                        {/* MARKET INSIGHTS CARD */}
                        <div className="card market-card-full">
                            <div className="market-card-header">
                                <div className="title-area">
                                    <h3>Top In-Demand Skills in Oman</h3>
                                    <p>Live market insights from job postings</p>
                                </div>
                                <div className="market-badge">
                                    <span className="dot"></span> Live Data
                                </div>
                            </div>

                            <div className="market-content">
                                <div className="skills-list-area">
                                    {marketLoading ? (
                                        <div className="loading-market">Loading insights...</div>
                                    ) : marketError || !marketData ? (
                                        <div className="error-market">Data currently unavailable</div>
                                    ) : (
                                        marketData.top_skills.slice(0, 8).map((item, i) => {
                                            const pct = Math.round((item.demand_count / maxDemand) * 60) + 10;
                                            return (
                                                <div key={item.skill} className="skill-row">
                                                    <div className="skill-info">
                                                        <div className="skill-icon">
                                                            {i === 0 ? <TrendingUp size={14} /> : <Zap size={14} />}
                                                        </div>
                                                        <span className="name">{item.skill}</span>
                                                    </div>
                                                    <div className="bar-wrapper">
                                                        <div className="bar-bg">
                                                            <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                        <span className="pct-label">{pct}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <button className="view-report-btn">
                                        <BarChart3 size={16} /> View Full Report
                                    </button>
                                </div>

                                <div className="jobs-analyzed-area">
                                    <div className="donut-chart-container">
                                        <div className="donut-chart">
                                            <div className="donut-segment s1"></div>
                                            <div className="donut-segment s2"></div>
                                            <div className="donut-segment s3"></div>
                                            <div className="donut-segment s4"></div>
                                            <div className="donut-center">
                                                <span className="num">{marketData?.total_jobs_analyzed || 148}</span>
                                                <span className="txt">Jobs<br />Analyzed</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="last-updated-box">
                                        <Clock size={20} />
                                        <div className="updated-text">
                                            <span className="lbl">Last Updated</span>
                                            <span className="val">
                                                {marketData ? new Date(marketData.last_updated).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'April 25, 2026'} • 07:37 AM
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR COLUMN */}
                    <div className="content-side">
                        {/* PROFILE COMPLETION */}
                        <div className="card side-card profile-comp">
                            <h4>Profile Completion</h4>
                            <div className="comp-viz">
                                <div className="progress-ring">
                                    <svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" className="ring-bg" />
                                        <circle cx="50" cy="50" r="40" className="ring-fill" style={{ strokeDashoffset: 251 - (251 * profileCompletion / 100) }} />
                                    </svg>
                                    <span className="pct">{profileCompletion}%</span>
                                </div>
                            </div>
                            <p className="comp-msg">Almost there! Add 2 more skills to boost your matching rate.</p>
                            <Button variant="outline" className="btn-comp" onClick={() => navigate('/profile')}>
                                Complete Profile <ArrowRight size={14} />
                            </Button>
                        </div>

                        {/* QUICK ACTIONS */}
                        <div className="card side-card quick-actions">
                            <h4>Quick Actions</h4>
                            <div className="actions-list">
                                <div className="action-item" onClick={() => navigate('/assessment')}>
                                    <div className="icon-wrap"><TrendingUp size={16} /></div>
                                    <span>Browse Assessments</span>
                                    <ChevronRight size={16} className="chevron" />
                                </div>
                                <div className="action-item" onClick={() => navigate('/jobs')}>
                                    <div className="icon-wrap"><Briefcase size={16} /></div>
                                    <span>Explore Jobs</span>
                                    <ChevronRight size={16} className="chevron" />
                                </div>
                                <div className="action-item" onClick={() => navigate('/matches')}>
                                    <div className="icon-wrap"><Users size={16} /></div>
                                    <span>View Matches</span>
                                    <ChevronRight size={16} className="chevron" />
                                </div>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY */}
                        <div className="card side-card recent-act">
                            <h4>Recent Activity</h4>
                            <div className="activity-stack">
                                {recentActivity.map(act => (
                                    <div key={act.id} className="act-item">
                                        <div className="act-icon">
                                            {act.type === 'assessment' ? <CheckCircle2 size={16} /> : <Shield size={16} />}
                                        </div>
                                        <div className="act-content">
                                            <p>{act.text}</p>
                                            <span>{act.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="view-all-link">View all activity <ArrowRight size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-container {
                    padding: 2rem;
                    background-color: #F5F9FA;
                    min-height: 100vh;
                    color: #1F2D3D;
                }

                /* HEADER */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .header-greeting h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin: 0;
                    color: #1F2D3D;
                }
                .header-greeting p {
                    margin: 0.25rem 0 0 0;
                    color: #6B7C85;
                    font-size: 0.95rem;
                }
                .header-tools {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }
                .tool-btn {
                    background: white;
                    border: 1px solid #E5EEF0;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #2E6F7E;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .user-avatar-mini {
                    width: 42px;
                    height: 42px;
                    background: rgba(111,179,167,0.15);
                    color: #2E6F7E;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                /* LAYOUT */
                .dashboard-content-layout {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                }

                /* HERO */
                .hero-banner {
                    width: 100%;
                    height: 250px;
                    background: linear-gradient(135deg, #2E6F7E, #3F808E);
                    border-radius: 24px;
                    padding: 32px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 2rem;
                    box-shadow: 0 10px 30px rgba(46, 111, 126, 0.15);
                }

                .hero-overlay-circle {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    z-index: 0;
                }
                .circle-lg {
                    width: 300px;
                    height: 300px;
                    top: -100px;
                    right: -50px;
                    opacity: 0.1;
                }
                .circle-sm {
                    width: 150px;
                    height: 150px;
                    bottom: -50px;
                    right: 150px;
                    opacity: 0.08;
                }

                .hero-left {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    max-width: 50%;
                    z-index: 1;
                }
                .hero-left h2 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #FFFFFF;
                    margin: 0;
                }
                .hero-left p {
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.6;
                    margin: 0;
                }
                .hero-cta {
                    display: flex;
                    gap: 16px;
                    margin-top: 12px;
                }

                .btn-hero-primary {
                    background: #FFFFFF !important;
                    color: #2E6F7E !important;
                    border-radius: 12px !important;
                    padding: 12px 18px !important;
                    font-weight: 600 !important;
                    border: none !important;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: auto !important;
                }
                .btn-hero-secondary {
                    background: transparent !important;
                    border: 1px solid rgba(255, 255, 255, 0.6) !important;
                    color: #FFFFFF !important;
                    border-radius: 12px !important;
                    padding: 12px 18px !important;
                    font-weight: 600 !important;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: auto !important;
                }

                .hero-right {
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    z-index: 1;
                }
                .hero-img {
                    width: 280px;
                    max-height: 200px;
                    object-fit: contain;
                }

                /* STATS */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: white;
                    border: 1px solid #E5EEF0;
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(111,179,167,0.15);
                    color: #2E6F7E;
                }
                .stat-info { display: flex; flex-direction: column; }
                .stat-val { font-size: 1.75rem; font-weight: 800; color: #1F2D3D; }
                .stat-label { font-size: 0.8rem; color: #6B7C85; margin-top: 2px; }
                .stat-hint { font-size: 0.75rem; font-weight: 600; margin-top: 8px; color: #2E6F7E; }

                /* MARKET CARD */
                .market-card-full {
                    background: white;
                    border: 1px solid #E5EEF0;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .market-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2.5rem;
                }
                .title-area h3 { font-size: 1.25rem; font-weight: 800; margin: 0; color: #1F2D3D; }
                .title-area p { margin: 4px 0 0 0; color: #6B7C85; font-size: 0.9rem; }
                .market-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(111,179,167,0.15);
                    color: #2E6F7E;
                    padding: 6px 12px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .market-badge .dot { width: 8px; height: 8px; background: #6FB3A7; border-radius: 50%; }

                .market-content {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 3rem;
                }

                .skill-row {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 1.2rem;
                }
                .skill-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 140px;
                }
                .skill-info .skill-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(111,179,167,0.15);
                    color: #2E6F7E;
                }
                .skill-info .name { font-size: 0.9rem; font-weight: 600; color: #1F2D3D; }
                
                .bar-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .bar-bg {
                    flex: 1;
                    height: 6px;
                    background: rgba(111,179,167,0.15);
                    border-radius: 100px;
                    overflow: hidden;
                }
                .bar-fill {
                    height: 100%;
                    border-radius: 100px;
                    background: #6FB3A7;
                }
                .pct-label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #6B7C85;
                    width: 35px;
                }

                .view-report-btn {
                    margin-top: 1.5rem;
                    background: white;
                    border: 1px solid #E5EEF0;
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #6B7C85;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .view-report-btn:hover { background: #F5F9FA; color: #2E6F7E; }

                /* DONUT CHART */
                .jobs-analyzed-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }
                .donut-chart {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .donut-segment {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 20px solid transparent;
                }
                .s1 { border-top-color: #2E6F7E; transform: rotate(45deg); }
                .s2 { border-right-color: #4C8D9B; transform: rotate(45deg); }
                .s3 { border-bottom-color: #6FB3A7; transform: rotate(45deg); }
                .s4 { border-left-color: rgba(111,179,167,0.4); transform: rotate(45deg); }
                
                .donut-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .donut-center .num { font-size: 2.25rem; font-weight: 800; color: #1F2D3D; line-height: 1; }
                .donut-center .txt { font-size: 0.8rem; color: #6B7C85; font-weight: 600; margin-top: 4px; }

                .last-updated-box {
                    background: #F5F9FA;
                    border-radius: 12px;
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    color: #6B7C85;
                }
                .updated-text { display: flex; flex-direction: column; }
                .updated-text .lbl { font-size: 0.75rem; color: #6B7C85; font-weight: 700; text-transform: uppercase; }
                .updated-text .val { font-size: 0.8rem; color: #1F2D3D; font-weight: 600; }

                /* SIDEBAR CARDS */
                .side-card {
                    background: white;
                    border: 1px solid #E5EEF0;
                    border-radius: 20px;
                    padding: 1.75rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .side-card h4 { font-size: 0.95rem; font-weight: 800; color: #1F2D3D; margin: 0 0 1.5rem 0; }

                /* PROFILE RING */
                .comp-viz {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }
                .progress-ring {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }
                .progress-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
                .ring-bg { fill: none; stroke: #E5EEF0; stroke-width: 10; }
                .ring-fill { fill: none; stroke: #2E6F7E; stroke-width: 10; stroke-linecap: round; stroke-dasharray: 251; }
                .progress-ring .pct {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #1F2D3D;
                }
                .comp-msg { font-size: 0.85rem; color: #64748B; text-align: center; margin: 0 0 1.5rem 0; line-height: 1.5; }
                .btn-comp {
                    width: 100%;
                    background: #2E6F7E !important;
                    color: white !important;
                    border: none !important;
                    font-weight: 700 !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 0.75rem !important;
                    border-radius: 12px !important;
                    box-shadow: 0 4px 12px rgba(46, 111, 126, 0.15);
                    transition: all 0.2s;
                }
                .btn-comp:hover {
                    background: #255a66 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(46, 111, 126, 0.2);
                }

                /* ACTIONS */
                .actions-list { display: flex; flex-direction: column; gap: 1rem; }
                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 8px 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-item:hover { transform: translateX(4px); }
                .action-item .icon-wrap {
                    width: 34px;
                    height: 34px;
                    background: rgba(111,179,167,0.15);
                    color: #2E6F7E;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-item span { flex: 1; font-size: 0.9rem; font-weight: 600; color: #1F2D3D; }
                .chevron { color: #6B7C85; opacity: 0.5; }

                /* RECENT ACTIVITY */
                .activity-stack { display: flex; flex-direction: column; gap: 1.5rem; }
                .act-item { display: flex; gap: 1rem; }
                .act-item .act-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(111,179,167,0.15);
                    color: #2E6F7E;
                }
                .act-content p { font-size: 0.85rem; font-weight: 600; color: #1F2D3D; margin: 0; }
                .act-content span { font-size: 0.75rem; color: #6B7C85; margin-top: 2px; display: block; }
                .view-all-link {
                    margin-top: 2rem;
                    background: none;
                    border: none;
                    color: #2E6F7E;
                    font-weight: 700;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    width: 100%;
                    justify-content: center;
                }

                @media (max-width: 1200px) {
                    .dashboard-content-layout { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .stats-row { grid-template-columns: repeat(2, 1fr); }
                    .hero-banner { flex-direction: column; text-align: center; gap: 2rem; padding: 2rem; }
                }
            `}</style>
        </DashboardLayout>
    );
};
