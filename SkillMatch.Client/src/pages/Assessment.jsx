import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { 
    Code2, 
    UploadCloud, 
    CheckCircle2, 
    AlertCircle, 
    ChevronLeft, 
    FileText,
    Loader2,
    Sparkles,
    Lightbulb
} from 'lucide-react';
import { Button } from '../components/Button';

export const Assessment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getCurrentUser() || {};
    
    const query = new URLSearchParams(location.search);
    const skillName = query.get('skill');

    const [skillDetails, setSkillDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!skillName) {
            navigate('/skills');
            return;
        }

        const fetchSkillMetadata = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/skills?major=${encodeURIComponent(skillName)}`);
                const data = await response.json();
                // Find the exact skill match
                const match = data.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
                setSkillDetails(match);
            } catch (err) {
                console.error("Failed to fetch skill metadata", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSkillMetadata();
    }, [skillName, navigate]);

    const handleSubmit = async () => {
        if (!submission.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/api/user/assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    skill_name: skillName,
                    submission: submission
                })
            });
            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Submission failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
                </div>
            </DashboardLayout>
        );
    }

    if (!skillDetails) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--color-error)" style={{ marginBottom: '1rem' }} />
                    <h3>Skill Not Found</h3>
                    <Button onClick={() => navigate('/skills')} style={{ marginTop: '1rem' }}>Back to Skills</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => navigate('/skills')}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}
                    >
                        <ChevronLeft size={16} /> Back to Skills
                    </button>
                </div>

                <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Skill Assessment</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            {skillName} • {skillDetails.category}
                        </p>
                    </div>
                </div>

                {!result ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Task Area */}
                        <div style={{ 
                            background: 'var(--color-bg-paper)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-xl)',
                            padding: '2rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    background: 'rgba(59, 130, 246, 0.1)', 
                                    borderRadius: '12px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    {skillDetails.assessment_type === 'code' ? <Code2 size={24} /> : <UploadCloud size={24} />}
                                </div>
                                <h3 style={{ margin: 0 }}>Practical Task</h3>
                            </div>

                            <div style={{ 
                                background: 'rgba(0,0,0,0.02)', 
                                padding: '1.5rem', 
                                borderRadius: '12px', 
                                marginBottom: '2rem', 
                                borderLeft: '4px solid var(--color-primary)' 
                            }}>
                                <p style={{ margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                                    {skillDetails.assessment_description}
                                </p>
                            </div>

                            {skillDetails.assessment_type === 'code' ? (
                                <div style={{ position: 'relative' }}>
                                    <textarea 
                                        className="form-control"
                                        placeholder="// Write your code here..."
                                        style={{ 
                                            minHeight: '300px', 
                                            fontFamily: 'monospace', 
                                            fontSize: '0.9rem',
                                            lineHeight: 1.5,
                                            padding: '1rem',
                                            background: '#1e293b',
                                            color: '#f8fafc',
                                            borderRadius: '8px',
                                            border: 'none'
                                        }}
                                        value={submission}
                                        onChange={(e) => setSubmission(e.target.value)}
                                    />
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: '1rem', 
                                        right: '1rem', 
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.75rem'
                                    }}>
                                        {submission.length} characters
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    style={{ 
                                        border: '2px dashed var(--color-border)', 
                                        borderRadius: '16px', 
                                        padding: '4rem 2rem', 
                                        textAlign: 'center',
                                        background: submission ? 'rgba(34, 197, 94, 0.05)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => setSubmission(e.target.files[0]?.name || '')}
                                    />
                                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <UploadCloud size={48} color="var(--color-text-muted)" style={{ margin: '0 auto' }} />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{submission || 'Click to select or drag and drop'}</h4>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                            PDF, PNG, JPG or ZIP (Max. 10MB)
                                        </p>
                                    </label>
                                    {submission && (
                                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                                            <FileText size={16} /> <span>{submission} selected</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    className="btn-primary" 
                                    style={{ padding: '0.75rem 2.5rem' }}
                                    onClick={handleSubmit}
                                    disabled={!submission || isSubmitting}
                                >
                                    {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Submit for Review'}
                                </Button>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                background: 'var(--color-bg-paper)', 
                                border: '1px solid var(--color-border)', 
                                borderRadius: 'var(--radius-xl)',
                                padding: '1.5rem'
                            }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
                                    <Sparkles size={18} color="#eab308" /> Evaluation Criteria
                                </h4>
                                <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                    <li>Completeness of the solution</li>
                                    <li>Adherence to requirements</li>
                                    <li>Technical accuracy</li>
                                    <li>Professional presentation</li>
                                </ul>
                            </div>

                            <div style={{ 
                                background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', 
                                border: 'none', 
                                borderRadius: 'var(--radius-xl)',
                                padding: '1.5rem',
                                color: 'white'
                            }}>
                                <h4 style={{ marginTop: 0 }}>Pro Tip</h4>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
                                    Ensure your code follows industry standard naming conventions and includes comments explaining complex logic.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Result Section */
                    <div style={{ 
                        background: 'var(--color-bg-paper)', 
                        border: '1px solid var(--color-border)', 
                        borderRadius: 'var(--radius-xl)',
                        padding: '3rem',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: result.status === 'Verified' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: result.status === 'Verified' ? 'var(--color-success)' : 'var(--color-warning)'
                        }}>
                            {result.status === 'Verified' ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                        </div>
                        
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            {result.status === 'Verified' ? 'Skill Verified!' : 'Needs Improvement'}
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto 2.5rem auto' }}>
                            {result.status === 'Verified' 
                                ? 'Congratulations! You have successfully demonstrated your proficiency in this skill.' 
                                : 'Your submission is a great start, but we noticed some areas for improvement to reach full proficiency.'}
                        </p>

                        <div style={{ 
                            background: 'rgba(59, 130, 246, 0.05)', 
                            border: '1px solid rgba(59, 130, 246, 0.2)', 
                            borderRadius: '24px', 
                            padding: '2.5rem',
                            textAlign: 'left',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                <Lightbulb size={120} color="var(--color-primary)" />
                            </div>
                            
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: 'var(--color-primary)' }}>
                                <Sparkles size={20} /> Development Plan Suggestion
                            </h4>
                            <p style={{ lineHeight: 1.7, color: 'var(--color-text)', fontSize: '1.05rem', margin: '1rem 0 0 0', position: 'relative', zIndex: 1 }}>
                                {result.suggestion}
                            </p>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <Button variant="outline" onClick={() => setResult(null)}>Redo Assessment</Button>
                            <Button className="btn-primary" onClick={() => navigate('/skills')}>Back to Skills</Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
