import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CheckCircle2, X } from 'lucide-react';

const OMAN_STATES = [
    "Muscat", "Dhofar", "Musandam", "Al Buraimi", "Ad Dakhiliyah", 
    "Ad Dhahirah", "Al Batinah North", "Al Batinah South", 
    "Ash Sharqiyah North", "Ash Sharqiyah South", "Al Wusta"
];

const JOB_TYPES = ["Full-Time", "Internship", "Contract"];

export const Profile = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        major: '',
        experience: 0,
        location: '',
        open_to_relocate: false,
        job_type: 'Full-Time',
        skills: []
    });

    const [allSkills, setAllSkills] = useState({ technical: [], soft: [] });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfileData({
                        name: data.name || user.name || '',
                        major: data.major || '',
                        experience: data.experience || 0,
                        location: data.location || '',
                        open_to_relocate: data.open_to_relocate || false,
                        job_type: data.job_type || 'Full-Time',
                        skills: data.skills || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };

        const fetchSkillsFromDB = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/skills');
                if (response.ok) {
                    const data = await response.json();
                    const technical = data.filter(s => s.category?.toLowerCase() === 'technical');
                    const soft = data.filter(s => s.category?.toLowerCase() === 'soft');
                    setAllSkills({ technical, soft });
                }
            } catch (err) {
                console.error("Failed to fetch skills:", err);
            }
        };

        Promise.all([fetchProfile(), fetchSkillsFromDB()]).finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    ...profileData
                })
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleSkill = (skillName) => {
        setProfileData(prev => {
            const exists = prev.skills.includes(skillName);
            if (exists) {
                return { ...prev, skills: prev.skills.filter(s => s !== skillName) };
            } else {
                return { ...prev, skills: [...prev.skills, skillName] };
            }
        });
    };

    if (loading) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-section" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <h3>Your Profile</h3>
                    {!isEditing && (
                        <button 
                            className="view-all" 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: '600' }}
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {error && <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{error}</div>}

                <div className="dashboard-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%' }}>
                            {profileData.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>{profileData.name}</h4>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>{user?.email}</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div className="profile-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Major</h5>
                                    <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>{profileData.major || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Experience</h5>
                                    <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>{profileData.experience} {profileData.experience === 1 ? 'Year' : 'Years'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Preferred Location</h5>
                                    <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>{profileData.location || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Job Type</h5>
                                    <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>{profileData.job_type || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Relocation</h5>
                                    <p style={{ fontWeight: '600', fontSize: '1.05rem', color: profileData.open_to_relocate ? '#10B981' : 'var(--color-text)' }}>
                                        {profileData.open_to_relocate ? 'Open to relocate' : 'Not willing to relocate'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>My Skills</h5>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {profileData.skills.length > 0 ? profileData.skills.map((skill, index) => (
                                        <span key={index} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: '600' }}>
                                            {skill}
                                        </span>
                                    )) : (
                                        <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>No skills added yet. Edit your profile to add skills.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }} className="animate-fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: '500', fontSize: '0.875rem' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profileData.name} 
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: '500', fontSize: '0.875rem' }}>Major</label>
                                    <select 
                                        value={profileData.major} 
                                        onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}
                                    >
                                        <option value="">Select Major</option>
                                        <option value="Information System">Information System</option>
                                        <option value="Software Engineering">Software Engineering</option>
                                        <option value="Network Computing">Network Computing</option>
                                        <option value="Web & Mobile Technologies">Web & Mobile Technologies</option>
                                        <option value="Cloud Computing">Cloud Computing</option>
                                        <option value="Data Science & AI">Data Science & AI</option>
                                        <option value="Cyber Security">Cyber Security</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: '500', fontSize: '0.875rem' }}>Experience (Years)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="50"
                                        value={profileData.experience} 
                                        onChange={(e) => setProfileData({...profileData, experience: parseInt(e.target.value) || 0})}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: '500', fontSize: '0.875rem' }}>Preferred Location (Oman)</label>
                                    <select 
                                        value={profileData.location} 
                                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}
                                    >
                                        <option value="">Select State</option>
                                        {OMAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: '500', fontSize: '0.875rem' }}>Job Type</label>
                                    <select 
                                        value={profileData.job_type} 
                                        onChange={(e) => setProfileData({...profileData, job_type: e.target.value})}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}
                                    >
                                        {JOB_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '1.75rem' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={profileData.open_to_relocate}
                                            onChange={(e) => setProfileData({...profileData, open_to_relocate: e.target.checked})}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                                        />
                                        <span style={{ fontWeight: '600', fontSize: '1rem', color: profileData.open_to_relocate ? 'var(--color-primary)' : 'var(--color-text)' }}>Open to Relocate</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '2.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Select Your Skills</h4>
                                
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <h5 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: '600' }}>Technical Skills</h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {allSkills.technical.map(skill => {
                                            const isSelected = profileData.skills.includes(skill.skill_name);
                                            return (
                                                <button
                                                    key={skill.skill_name}
                                                    type="button"
                                                    onClick={() => toggleSkill(skill.skill_name)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                        background: isSelected ? 'var(--color-primary)' : 'white',
                                                        color: isSelected ? 'white' : 'var(--color-text)',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    {skill.skill_name}
                                                    {isSelected && <CheckCircle2 size={14} />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                
                                <div>
                                    <h5 style={{ fontSize: '1rem', color: '#10B981', marginBottom: '1rem', fontWeight: '600' }}>Soft Skills</h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {allSkills.soft.map(skill => {
                                            const isSelected = profileData.skills.includes(skill.skill_name);
                                            return (
                                                <button
                                                    key={skill.skill_name}
                                                    type="button"
                                                    onClick={() => toggleSkill(skill.skill_name)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        border: `2px solid ${isSelected ? '#10B981' : 'var(--color-border)'}`,
                                                        background: isSelected ? '#10B981' : 'white',
                                                        color: isSelected ? 'white' : 'var(--color-text)',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    {skill.skill_name}
                                                    {isSelected && <CheckCircle2 size={14} />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile Changes'}</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
