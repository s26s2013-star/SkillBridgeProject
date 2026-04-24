import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { 
    Calendar, Play, BookOpen, Sparkles, RefreshCw, 
    ArrowRight, Loader2, AlertCircle, CheckCircle2,
    ExternalLink, Timer, Target
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
    }, [user?.email]);

    const loadingTips = [
        "Analyzing your weak skills...",
        "Searching for the best free courses...",
        "Structuring your personal roadmap...",
        "Curating high-quality YouTube playlists...",
        "Almost there! Designing your path to mastery..."
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
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Your Personalized Upskill Plan</h2>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem' }}>
                            A data-driven roadmap designed to turn your weak skills into strengths.
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
                            Generate a personalized upskill plan based on your current skill levels and assessment results.
                        </p>
                        <Button variant="primary" size="lg" onClick={generatePlan} style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}>
                            Generate My Upskill Plan
                        </Button>
                    </div>
                ) : (
                    <div className="roadmap-grid">
                        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '1.25rem 2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Timer size={20} />
                                    <span style={{ fontWeight: 600 }}>Duration: {plan.duration}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={20} />
                                    <span style={{ fontWeight: 600 }}>Modules: {plan.weeks.length}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                                <CheckCircle2 size={18} />
                                <span style={{ fontSize: '0.9rem' }}>Tailored to your weak skills</span>
                            </div>
                        </div>

                        {plan.weeks.map((week, index) => (
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
                                            <Play size={16} color="var(--color-primary)" /> Curated Resources
                                        </h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                            {week.courses.map((course, cIdx) => (
                                                <a 
                                                    key={cIdx} 
                                                    href={course.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="resource-card"
                                                    style={{ 
                                                        display: 'flex', gap: '1rem', padding: '1rem', 
                                                        borderRadius: 'var(--radius-md)', background: 'var(--color-bg)',
                                                        border: '1px solid var(--color-border)', textDecoration: 'none',
                                                        color: 'inherit', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {course.thumbnail && (
                                                        <img src={course.thumbnail} alt="" style={{ width: '80px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{course.source}</div>
                                                    </div>
                                                    <ExternalLink size={14} style={{ opacity: 0.5, marginTop: '2px' }} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .resource-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                    border-color: var(--color-primary) !important;
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
