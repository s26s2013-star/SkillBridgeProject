import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, CheckCircle2, Clock, Info, Search } from 'lucide-react';
import { authService } from '../services/authService';
import { mockUser } from '../data/mockDashboardData';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Skills = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || mockUser;

    // Local state for demonstration
    const [skills, setSkills] = useState(mockUser.topSkills);
    const [newSkill, setNewSkill] = useState('');
    const [newLevel, setNewLevel] = useState('Beginner');
    const [showAddForm, setShowAddForm] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (!newSkill.trim()) return;

        const skillToAdd = {
            name: newSkill,
            progress: newLevel === 'Beginner' ? 30 : newLevel === 'Intermediate' ? 60 : 90,
            status: 'Not tested',
            level: newLevel
        };

        setSkills([skillToAdd, ...skills]);
        setNewSkill('');
        setShowAddForm(false);
    };

    const handleRemoveSkill = (name) => {
        setSkills(skills.filter(s => s.name !== name));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified': return <CheckCircle2 size={14} className="check-icon" />;
            case 'Pending': return <Clock size={14} style={{ color: '#F59E0B' }} />;
            default: return <Info size={14} style={{ color: 'var(--color-text-muted)' }} />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Verified': return 'verified';
            case 'Pending': return 'pending';
            default: return 'unverified';
        }
    };

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="skills-page-container">
                {/* Header */}
                <div className="section-header" style={{ marginBottom: '2rem', display: 'block' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Skills</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Manage your skills to improve your job matches.</p>
                </div>

                {/* Add Skill Section */}
                <section className="dashboard-section" style={{ marginBottom: '2.5rem' }}>
                    <div className="section-header">
                        <h3>{showAddForm ? 'Add New Skill' : 'Skills Overview'}</h3>
                        <Button
                            variant={showAddForm ? 'outline' : 'primary'}
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Skill</>}
                        </Button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddSkill} className="add-skill-form animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', backgroundColor: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <Input
                                label="Skill Name"
                                placeholder="e.g. React, Python, UI Design"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                style={{ marginBottom: 0 }}
                            />
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Skill Level</label>
                                <select
                                    value={newLevel}
                                    onChange={(e) => setNewLevel(e.target.value)}
                                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <Button type="submit" style={{ height: '48px' }}>Add Component</Button>
                        </form>
                    )}

                    {!showAddForm && (
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <div className="icon-wrapper blue" style={{ width: '40px', height: '40px' }}><Plus size={20} /></div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{skills.length} Skills Added</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Improve matches with more skills</p>
                                </div>
                            </div>
                            <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <div className="icon-wrapper green" style={{ width: '40px', height: '40px' }}><CheckCircle2 size={20} /></div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{skills.filter(s => s.status === 'Verified').length} Verified</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Boost your credibility</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Skills List Grid */}
                <div className="jobs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {skills.map((skill, index) => (
                        <div key={`${skill.name}-${index}`} className="job-card animate-fade-in" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{skill.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="match-badge" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                            {skill.level}
                                        </span>
                                        <span className={`status ${getStatusClass(skill.status)}`} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {getStatusIcon(skill.status)} {skill.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveSkill(skill.name)}
                                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'var(--transition)' }}
                                    className="remove-btn-hover"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="skill-item" style={{ marginBottom: '1rem' }}>
                                <div className="skill-info" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Proficiency Level</span>
                                    <span className="skill-percentage">{skill.progress}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div
                                        className={`progress-bar-fill ${skill.status === 'Verified' ? 'verified' : 'unverified'}`}
                                        style={{ width: `${skill.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                                {skill.status !== 'Verified' && (
                                    <Button variant="outline" className="btn-full" style={{ fontSize: '0.8125rem' }}>
                                        {skill.status === 'Pending' ? 'Resume Test' : 'Start Assessment'}
                                    </Button>
                                )}
                                {skill.status === 'Verified' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.875rem', fontWeight: '600', width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
                                        <CheckCircle2 size={16} /> Verified Proficiency
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {skills.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>No skills added yet. Start by adding your first skill!</p>
                            <Button onClick={() => setShowAddForm(true)} style={{ marginTop: '1.5rem' }}>+ Add My First Skill</Button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .remove-btn-hover:hover {
                    background-color: #FEE2E2 !important;
                }
                .pending {
                    color: #F59E0B;
                }
                .unverified {
                    color: var(--color-text-muted);
                }
            `}</style>
        </DashboardLayout>
    );
};
