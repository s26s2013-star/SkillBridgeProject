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
    Shield,
    Building,
    MapPin,
    Star
} from 'lucide-react';

const MOCK_STATS = {
    totalJobs: 1245,
    activeCompanies: 84,
    studentsAssessed: 3420,
    averageMatchScore: 82
};

const MOCK_TOP_SKILLS = [
    { skill: "Backend Development (APIs)", demand: 450, growth: "+24%", jobs: "Backend Engineer, API Developer" },
    { skill: "Data Analysis (Python)", demand: 380, growth: "+18%", jobs: "Data Analyst, BI Consultant" },
    { skill: "Machine Learning", demand: 310, growth: "+32%", jobs: "ML Engineer, AI Researcher" },
    { skill: "Network Security", demand: 290, growth: "+15%", jobs: "Security Analyst, Pen Tester" },
    { skill: "Routing & Switching", demand: 210, growth: "+8%", jobs: "Network Engineer, IT Admin" },
    { skill: "Testing & Debugging", demand: 180, growth: "+12%", jobs: "QA Engineer, SDET" }
];

const MOCK_RECOMMENDED_JOBS = [
    { id: 1, title: "Software Engineer", company: "Omantel", location: "Muscat, Oman", salary: "OMR 1,200 - 1,500", match: 92, type: "Full-time" },
    { id: 2, title: "Data Analyst", company: "Bank Muscat", location: "Muscat, Oman", salary: "OMR 900 - 1,200", match: 88, type: "Full-time" },
    { id: 3, title: "Backend Developer", company: "Oman Data Park", location: "KOM, Muscat", salary: "OMR 1,000 - 1,400", match: 85, type: "Hybrid" }
];

const MOCK_RECENT_ACTIVITY = [
    { id: 1, type: "company", text: "Omantel posted a new Software Engineer role.", time: "2 hours ago", icon: 'building' },
    { id: 2, type: "assessment", text: "You scored 90% in Python Data Analysis.", time: "5 hours ago", icon: 'check' },
    { id: 3, type: "match", text: "New match! Bank Muscat viewed your profile.", time: "1 day ago", icon: 'users' }
];

export const Dashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || {};

    const [profileCompletion, setProfileCompletion] = useState(50);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(user.email)}`);
                if (!profileResponse.ok) return;
                const profileData = await profileResponse.json();

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
            } catch (error) {
                console.error("Dashboard data sync failed:", error);
            }
        };

        if (user.email) {
            fetchUserData();
        }
    }, [user?.email]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-container">
                {/* PAGE HEADER */}
                <header className="page-header">
                    <div className="header-greeting">
                        <h2>Welcome back, {user.name?.split(' ')[0] || 'Nusayba'}</h2>
                        <p>Track your skills, grow your expertise and unlock better opportunities.</p>
                    </div>
                    <div className="header-tools">
                        <div 
                            className="user-avatar-mini" 
                            onClick={() => navigate('/profile')} 
                            style={{ cursor: 'pointer' }}
                        >
                            {user.name?.charAt(0) || 'N'}
                        </div>
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
                                <div className="stat-icon"><Briefcase size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{MOCK_STATS.totalJobs.toLocaleString()}</span>
                                    <span className="stat-label">Total Jobs</span>
                                    <span className="stat-hint">+12% this week</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Building size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{MOCK_STATS.activeCompanies}</span>
                                    <span className="stat-label">Active Companies</span>
                                    <span className="stat-hint">Hiring now</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Users size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{MOCK_STATS.studentsAssessed.toLocaleString()}</span>
                                    <span className="stat-label">Students Assessed</span>
                                    <span className="stat-hint">In Oman</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><Target size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{MOCK_STATS.averageMatchScore}%</span>
                                    <span className="stat-label">Avg. Match Score</span>
                                    <span className="stat-hint">Platform wide</span>
                                </div>
                            </div>
                        </div>

                        {/* TOP SKILLS IN DEMAND */}
                        <div className="card market-card-full">
                            <div className="market-card-header">
                                <div className="title-area">
                                    <h3>Top Skills in Demand</h3>
                                    <p>Live market insights from job postings in Oman</p>
                                </div>
                                <div className="market-badge">
                                    <span className="dot"></span> Live Data
                                </div>
                            </div>

                            <div className="market-content-grid">
                                {MOCK_TOP_SKILLS.map((item, i) => (
                                    <div key={item.skill} className="top-skill-card">
                                        <div className="ts-header">
                                            <div className="ts-icon">
                                                <TrendingUp size={16} />
                                            </div>
                                            <div className="ts-growth">{item.growth}</div>
                                        </div>
                                        <h4 className="ts-title">{item.skill}</h4>
                                        <p className="ts-jobs">{item.jobs}</p>
                                        <div className="ts-demand">
                                            <span className="ts-dval">{item.demand}</span> open roles
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RECOMMENDED JOBS */}
                        <div className="recommended-jobs-section">
                            <div className="section-header">
                                <div>
                                    <h3>Recommended Jobs</h3>
                                    <p>Based on your verified skills</p>
                                </div>
                                <Button variant="outline" className="view-all-btn" onClick={() => navigate('/jobs')}>
                                    View All <ArrowRight size={14} style={{ marginLeft: '4px' }}/>
                                </Button>
                            </div>
                            <div className="jobs-grid">
                                {MOCK_RECOMMENDED_JOBS.map(job => (
                                    <div key={job.id} className="job-card-mini">
                                        <div className="jc-header">
                                            <div className="jc-company-logo">
                                                <Building size={20} />
                                            </div>
                                            <div className="jc-match-badge">
                                                <Star size={12} fill="currentColor" /> {job.match}% Match
                                            </div>
                                        </div>
                                        <h4 className="jc-title">{job.title}</h4>
                                        <p className="jc-company">{job.company}</p>
                                        <div className="jc-details">
                                            <span><MapPin size={12}/> {job.location}</span>
                                            <span><Briefcase size={12}/> {job.type}</span>
                                        </div>
                                        <div className="jc-footer">
                                            <span className="jc-salary">{job.salary}</span>
                                            <button className="jc-apply-btn">Apply Now</button>
                                        </div>
                                    </div>
                                ))}
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
                                {MOCK_RECENT_ACTIVITY.map(act => (
                                    <div key={act.id} className="act-item">
                                        <div className="act-icon">
                                            {act.icon === 'building' ? <Building size={16} /> : act.icon === 'check' ? <CheckCircle2 size={16} /> : <Users size={16} />}
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
                    margin-bottom: 2rem;
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

                /* NEW TOP SKILLS GRID */
                .market-content-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                }
                .top-skill-card {
                    background: #F5F9FA;
                    border-radius: 16px;
                    padding: 1.25rem;
                    border: 1px solid #E5EEF0;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .top-skill-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(46, 111, 126, 0.1);
                    border-color: rgba(111,179,167,0.4);
                }
                .ts-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }
                .ts-icon {
                    width: 32px;
                    height: 32px;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #2E6F7E;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .ts-growth {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #059669;
                    background: #D1FAE5;
                    padding: 4px 8px;
                    border-radius: 100px;
                }
                .ts-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1F2D3D;
                    margin: 0 0 4px 0;
                }
                .ts-jobs {
                    font-size: 0.8rem;
                    color: #6B7C85;
                    margin: 0 0 1rem 0;
                    line-height: 1.4;
                }
                .ts-demand {
                    font-size: 0.85rem;
                    color: #6B7C85;
                    font-weight: 500;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    padding-top: 0.75rem;
                }
                .ts-dval {
                    font-weight: 800;
                    color: #2E6F7E;
                }

                /* RECOMMENDED JOBS */
                .recommended-jobs-section {
                    margin-top: 2rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }
                .section-header h3 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #1F2D3D;
                    margin: 0;
                }
                .section-header p {
                    margin: 4px 0 0 0;
                    color: #6B7C85;
                    font-size: 0.9rem;
                }
                .view-all-btn {
                    font-size: 0.85rem !important;
                    padding: 0.5rem 1rem !important;
                }
                .jobs-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                }
                .job-card-mini {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    border: 1px solid #E5EEF0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .job-card-mini:hover {
                    box-shadow: 0 8px 16px rgba(46, 111, 126, 0.08);
                    border-color: #6FB3A7;
                }
                .jc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                .jc-company-logo {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: rgba(111,179,167,0.1);
                    color: #2E6F7E;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .jc-match-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #FEF3C7;
                    color: #D97706;
                    padding: 4px 8px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .jc-title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #1F2D3D;
                    margin: 0 0 4px 0;
                }
                .jc-company {
                    font-size: 0.9rem;
                    color: #2E6F7E;
                    font-weight: 600;
                    margin: 0 0 1rem 0;
                }
                .jc-details {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 1.25rem;
                }
                .jc-details span {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: #6B7C85;
                }
                .jc-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #E5EEF0;
                    padding-top: 1rem;
                }
                .jc-salary {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #1F2D3D;
                }
                .jc-apply-btn {
                    background: #2E6F7E;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .jc-apply-btn:hover {
                    background: #255a66;
                }

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
                    flex-shrink: 0;
                }
                .act-content p { font-size: 0.85rem; font-weight: 600; color: #1F2D3D; margin: 0; line-height: 1.3; }
                .act-content span { font-size: 0.75rem; color: #6B7C85; margin-top: 4px; display: block; }
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
                    .market-content-grid { grid-template-columns: 1fr; }
                    .jobs-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
};

export default Dashboard;
