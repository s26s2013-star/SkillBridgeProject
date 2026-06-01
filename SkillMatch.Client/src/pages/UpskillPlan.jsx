import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/api';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import {
    Play, BookOpen, Sparkles, RefreshCw,
    ArrowRight, Loader2, AlertCircle, CheckCircle2,
    ExternalLink, Timer, Target, Zap, Layout,
    TrendingUp, Award, ChevronDown, ChevronUp, Youtube
} from 'lucide-react';

export const UpskillPlan = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [expandedWeeks, setExpandedWeeks] = useState({ 0: true });

    const fetchPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/upskill-plan?email=${encodeURIComponent(user.email)}`);
            const data = await response.json();
            setPlan(data.status === 'empty' ? null : data);
        } catch (err) {
            setError("Could not load your upskill plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        setGenerating(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/upskill-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Generation failed");
            }
            const data = await response.json();
            setPlan(data);
        } catch (err) {
            setError(err.message || "AI generation failed. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (!user?.email) { navigate('/login'); return; }
        fetchPlan();
    }, [user?.email]);

    const loadingTips = [
        "Analyzing your weak skills...",
        "Evaluating market demands in Oman...",
        "Prioritizing your skill development...",
        "Finding high-quality verified resources...",
        "Designing your final capstone project..."
    ];
    const [tipIndex, setTipIndex] = useState(0);
    useEffect(() => {
        if (!generating) return;
        const interval = setInterval(() => setTipIndex(p => (p + 1) % loadingTips.length), 2800);
        return () => clearInterval(interval);
    }, [generating]);

    const matchColor = (match) => {
        if (match === 'High') return '#10B981';
        if (match === 'Medium') return '#F59E0B';
        return '#EF4444';
    };

    const demandColor = (demand) => {
        if (demand === 'High') return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
        if (demand === 'Medium') return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
        return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
    };

    if (loading) return (
        <DashboardLayout user={user}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading your personalized plan...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout user={user}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.6rem', borderRadius: '12px' }}>
                                <Target size={24} color="var(--color-primary)" />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Your AI Upskill Plan</h2>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', margin: 0 }}>
                            A market-driven roadmap with verified resources, customized for your skill gaps.
                        </p>
                    </div>
                    {plan && !generating && (
                        <Button variant="outline" onClick={generatePlan} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={16} /> Regenerate Plan
                        </Button>
                    )}
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {generating ? (
                    <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
                            <Loader2 className="animate-spin" size={80} color="var(--color-primary)" style={{ opacity: 0.15 }} />
                            <Sparkles className="animate-pulse" size={40} color="var(--color-primary)" style={{ position: 'absolute', top: '20px', left: '20px' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>AI is Crafting Your Future</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>{loadingTips[tipIndex]}</p>
                    </div>
                ) : !plan ? (
                    <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)' }}>
                        <Sparkles size={56} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem' }}>No active plan found</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
                            Generate a personalized, market-aligned upskill plan based on your current skill gaps and the Omani IT job market.
                        </p>
                        <Button variant="primary" onClick={generatePlan} style={{ padding: '0.75rem 2.5rem', fontSize: '1.05rem' }}>
                            Generate My Upskill Plan
                        </Button>
                    </div>
                ) : (
                    <div style={{ animation: 'slideUp 0.4s ease-out' }}>

                        {/* Stats bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'Weak Skills', value: plan.weak_skills_count ?? '—', icon: <AlertCircle size={18} />, color: '#EF4444' },
                                { label: 'Strong Skills', value: plan.strong_skills_count ?? '—', icon: <CheckCircle2 size={18} />, color: '#10B981' },
                                { label: 'Learning Weeks', value: plan.weeks?.length ?? 4, icon: <Timer size={18} />, color: 'var(--color-primary)' },
                                { label: 'Certifications', value: plan.certifications?.length ?? 0, icon: <Award size={18} />, color: '#F59E0B' },
                            ].map((stat, i) => (
                                <div key={i} style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ color: stat.color }}>{stat.icon}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Skill Gap Analysis */}
                        {plan.skill_gap_analysis && (
                            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
                                    <AlertCircle size={20} /> Skill Gap Analysis
                                </h3>
                                <p style={{ color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.02rem' }}>
                                    {typeof plan.skill_gap_analysis === 'string'
                                        ? plan.skill_gap_analysis
                                        : plan.skill_gap_analysis.summary}
                                </p>
                                {typeof plan.skill_gap_analysis === 'object' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {plan.skill_gap_analysis.strengths?.length > 0 && (
                                            <div style={{ background: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10B981', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✅ Your Strengths</h4>
                                                {plan.skill_gap_analysis.strengths.map((s, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                                        <span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0 }}>•</span>{s}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {plan.skill_gap_analysis.improvement_areas?.length > 0 && (
                                            <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EF4444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎯 Areas to Improve</h4>
                                                {plan.skill_gap_analysis.improvement_areas.map((s, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                                        <span style={{ color: '#EF4444', fontWeight: 700, flexShrink: 0 }}>•</span>{s}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {plan.skill_gap_analysis?.career_trajectories?.length > 0 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <TrendingUp size={16} color="var(--color-primary)" /> Potential Career Paths
                                        </h4>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            {plan.skill_gap_analysis.career_trajectories.map((ct, i) => (
                                                <div key={i} style={{ flex: '1', minWidth: '180px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ct.title}</span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: matchColor(ct.match), background: `${matchColor(ct.match)}18`, padding: '0.2rem 0.5rem', borderRadius: '99px' }}>{ct.match}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>{ct.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Top Priorities */}
                        {plan.prioritized_skills?.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Zap size={20} color="var(--color-primary)" /> Top Skill Priorities
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {plan.prioritized_skills.map((item, idx) => {
                                        const dc = demandColor(item.market_demand);
                                        return (
                                            <div key={idx} style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', gap: '1rem' }}>
                                                <div style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', fontWeight: 800, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{item.skill}</h4>
                                                        {item.market_demand && (
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: dc.color, background: dc.bg, padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                                                                {item.market_demand} demand
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{item.reason}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Weekly Learning Plan */}
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={20} color="var(--color-primary)" /> 4-Week Learning Roadmap
                        </h3>
                        {plan.weeks?.map((week, index) => {
                            const isExpanded = expandedWeeks[index] !== false;
                            return (
                                <div key={index} style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', marginBottom: '1rem', overflow: 'hidden' }}>
                                    <div
                                        onClick={() => setExpandedWeeks(prev => ({ ...prev, [index]: !isExpanded }))}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.75rem', cursor: 'pointer', background: isExpanded ? 'rgba(59,130,246,0.03)' : 'transparent' }}
                                    >
                                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '3px solid var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Week</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{week.week}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{week.topic}</h4>
                                                {week.skill_focus && week.skill_focus !== week.topic && (
                                                    <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>
                                                        {week.skill_focus}
                                                    </span>
                                                )}
                                                {week.estimated_hours && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Timer size={12} /> ~{week.estimated_hours}h
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                                                {week.description?.substring(0, 120)}{week.description?.length > 120 ? '...' : ''}
                                            </p>
                                        </div>
                                        <div style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div style={{ padding: '0 1.75rem 1.75rem', borderTop: '1px solid var(--color-border)' }}>
                                            <p style={{ color: 'var(--color-text)', lineHeight: 1.7, margin: '1.25rem 0 1.5rem', fontSize: '1rem' }}>{week.description}</p>
                                            <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Learning Resources</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {week.youtube_video && (
                                                    <a href={week.youtube_video.url} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,0,0,0.04)', border: '1px solid rgba(255,0,0,0.15)', textDecoration: 'none', color: 'var(--color-text)' }}>
                                                        <Youtube size={20} color="#FF0000" />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{week.youtube_video.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{week.youtube_video.provider}</div>
                                                        </div>
                                                        <ExternalLink size={14} color="var(--color-text-muted)" />
                                                    </a>
                                                )}
                                                {week.curated_courses?.map((course, ci) => (
                                                    <a key={ci} href={course.url} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text)' }}>
                                                        <BookOpen size={18} color="var(--color-primary)" />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{course.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{course.provider} {course.free && <span style={{ color: '#10B981', fontWeight: 700 }}>• Free</span>}</div>
                                                        </div>
                                                        <ExternalLink size={14} color="var(--color-text-muted)" />
                                                    </a>
                                                ))}
                                                {!week.curated_courses?.length && week.learning_resource && (
                                                    <a href={week.learning_resource} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text)' }}>
                                                        <Play size={18} color="var(--color-primary)" />
                                                        <span style={{ fontWeight: 600 }}>{week.resource_title || 'Open Resource'}</span>
                                                        <ExternalLink size={14} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Certifications */}
                        {plan.certifications?.length > 0 && (
                            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Award size={20} color="#F59E0B" /> Recommended Certifications
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {plan.certifications.map((cert, i) => (
                                        <div key={i} style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, flex: 1 }}>{cert.name}</h4>
                                                {cert.free && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.5rem', borderRadius: '99px', flexShrink: 0, marginLeft: '0.5rem' }}>FREE</span>}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{cert.provider}</div>
                                            {cert.relevance && <p style={{ fontSize: '0.82rem', color: 'var(--color-text)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>{cert.relevance}</p>}
                                            {cert.url && cert.url.startsWith('https://') && (
                                                <a href={cert.url} target="_blank" rel="noopener noreferrer"
                                                    style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    View Certification <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Capstone Project */}
                        {plan.suggested_project && (
                            <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(59,130,246,0.15))', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{ background: 'var(--color-primary)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Layout size={28} color="white" />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Capstone Project</div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.6rem' }}>{plan.suggested_project.title}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 1rem' }}>{plan.suggested_project.description}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {plan.suggested_project.skills_practiced?.map((s, i) => (
                                            <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 600 }}>{s}</span>
                                        ))}
                                        {plan.suggested_project.difficulty && (
                                            <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 600 }}>
                                                {plan.suggested_project.difficulty}
                                            </span>
                                        )}
                                        {plan.suggested_project.estimated_hours && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Timer size={11} /> ~{plan.suggested_project.estimated_hours}h
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(16px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </DashboardLayout>
    );
};