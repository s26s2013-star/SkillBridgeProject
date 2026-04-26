import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { 
    Calendar, Play, BookOpen, Sparkles, RefreshCw, 
    ArrowRight, Loader2, AlertCircle, CheckCircle2,
    ExternalLink, Timer, Target, Zap, Layout
} from 'lucide-react';

export const UpskillPlan = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/upskill-plan?email=${encodeURIComponent(user.email)}`);
            const data = await response.json();
            
            if (data.status === 'empty') {
                setPlan(null);
            } else {
                setPlan(data);
            }
        } catch (err) {
            console.error("Failed to fetch upskill plan:", err);
            setError("Could not load your upskill plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        setGenerating(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/upskill-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await response.json();
            setPlan(data);
        } catch (err) {
            console.error("Failed to generate upskill plan:", err);
            setError("AI generation failed. Please check your internet connection and try again.");
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (!user || !user.email) {
            navigate('/login');
            return;
        }
        fetchPlan();
    }, [user?.email, navigate]);

    const loadingTips = [
        "Analyzing your weak skills...",
        "Evaluating market demands in Oman...",
        "Prioritizing your skill development...",
        "Finding high-quality learning resources...",
        "Designing your final capstone project..."
    ];

    const [tipIndex, setTipIndex] = useState(0);
    useEffect(() => {
        if (generating) {
            const interval = setInterval(() => {
                setTipIndex((prev) => (prev + 1) % loadingTips.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [generating]);

    if (loading) {
        return (
            <DashboardLayout user={user}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '1.5rem' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
                    <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading your personalized plan...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user}>
            <div className="upskill-container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
                                <Target size={24} color="var(--color-primary)" />
                            </div>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Your AI Upskill Plan</h2>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem' }}>
                            A comprehensive, market-driven roadmap customized for your career goals.
                        </p>
                    </div>
                    {plan && !generating && (
                        <Button 
                            variant="outline" 
                            onClick={generatePlan}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RefreshCw size={18} /> Regenerate Plan
                        </Button>
                    )}
                </div>

                {generating ? (
                    <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
                            <Loader2 className="animate-spin" size={80} color="var(--color-primary)" style={{ opacity: 0.2 }} />
                            <Sparkles className="animate-pulse" size={40} color="var(--color-primary)" style={{ position: 'absolute', top: '20px', left: '20px' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI is Crafting Your Future</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                            {loadingTips[tipIndex]}
                        </p>
                    </div>
                ) : !plan ? (
                    <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)' }}>
                        <Sparkles size={60} color="var(--color-primary)" style={{ margin: '0 auto 2rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 700 }}>No active plan found</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                            Generate a personalized, market-aligned upskill plan based on your current skill gaps.
                        </p>
                        <Button variant="primary" size="lg" onClick={generatePlan} style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}>
                            Generate My Upskill Plan
                        </Button>
                    </div>
                ) : (
                    <div className="roadmap-grid">
                        {/* Skill Gap Analysis */}
                        {plan.skill_gap_analysis && (
                            <div style={{ background: 'var(--color-white)', borderLeft: '4px solid var(--color-primary)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                                    <AlertCircle size={20} color="var(--color-primary)"/> Skill Gap Analysis
                                </h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                                    {plan.skill_gap_analysis}
                                </p>
                            </div>
                        )}

                        {/* Prioritized Skills */}
                        {plan.prioritized_skills && plan.prioritized_skills.length > 0 && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Zap size={22} color="var(--color-primary)" /> Top Priorities
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                    {plan.prioritized_skills.map((item, idx) => (
                                        <div key={idx} style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ background: 'var(--color-bg)', color: 'var(--color-primary)', fontWeight: 800, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.skill}</h4>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '1.25rem 2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Timer size={20} />
                                    <span style={{ fontWeight: 600 }}>Duration: 4 Weeks</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={20} />
                                    <span style={{ fontWeight: 600 }}>Modules: {plan.weeks?.length || 0}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                                <CheckCircle2 size={18} />
                                <span style={{ fontSize: '0.9rem' }}>Tailored to your weak skills</span>
                            </div>
                        </div>

                        {/* Learning Roadmap */}
                        {plan.weeks && plan.weeks.map((week, index) => (
                            <div key={index} className="week-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem', marginBottom: '3rem', position: 'relative' }}>
                                {/* Timeline line */}
                                {index < plan.weeks.length - 1 && (
                                    <div style={{ position: 'absolute', top: '80px', left: '40px', bottom: '-40px', width: '2px', background: 'var(--color-border)', borderStyle: 'dashed' }}></div>
                                )}
                                
                                {/* Week Circle */}
                                <div style={{ 
                                    width: '80px', height: '80px', borderRadius: '50%', 
                                    background: 'var(--color-white)', border: '4px solid var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 1, boxShadow: 'var(--shadow-md)'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Week</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{week.week}</div>
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                    <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>{week.topic}</h4>
                                    <p style={{ color: 'var(--color-text)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>{week.description}</p>
                                    
                                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Play size={16} color="var(--color-primary)" /> Recommended Resource
                                        </h5>
                                        {week.learning_resource && (
                                            <a 
                                                href={week.learning_resource} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="resource-card"
                                                style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', 
                                                    borderRadius: 'var(--radius-md)', background: 'var(--color-bg)',
                                                    border: '1px solid var(--color-border)', textDecoration: 'none',
                                                    color: 'var(--color-text)', transition: 'all 0.2s', fontWeight: 600
                                                }}
                                            >
                                                <span>Watch Tutorial</span>
                                                <ExternalLink size={16} color="var(--color-primary)" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Suggested Project */}
                        {plan.suggested_project && (
                            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.15) 100%)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ background: 'var(--color-primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}>
                                    <Layout size={32} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Capstone Project</div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{plan.suggested_project.title}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                                        {plan.suggested_project.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .resource-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                    border-color: var(--color-primary) !important;
                    background: var(--color-white) !important;
                }
                .roadmap-grid {
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </DashboardLayout>
    );
};
