import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, CheckCircle2, Clock, Info, Search } from 'lucide-react';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Skills = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser() || {};

    // Local state for skills
    const [skills, setSkills] = useState([]);
    const [dbSkillsList, setDbSkillsList] = useState([]);
    const [checkedSkills, setCheckedSkills] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(user.major || 'Information System');
    const [newLevel, setNewLevel] = useState('Beginner');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (!user || !user.email) return;

        const loadData = async () => {
            try {
                // Fetch all system skills to grab category metadata
                const skillsRes = await fetch('http://127.0.0.1:8000/api/skills');
                const allDbSkills = skillsRes.ok ? await skillsRes.json() : [];
                setDbSkillsList(allDbSkills);

                // Fetch current user's personalized profile details
                const profileRes = await fetch(`http://127.0.0.1:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
                let userSkillNames = [];
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    userSkillNames = profileData.skills || [];
                }

                // Match user's tracked skills against the system database
                const formattedUserSkills = userSkillNames.map((skillObj, index) => {
                    const skillName = typeof skillObj === 'string' ? skillObj : skillObj.name;
                    const dbSkill = allDbSkills.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
                    const level = typeof skillObj === 'string' ? (index % 3 === 0 ? 'Advanced' : index % 3 === 1 ? 'Intermediate' : 'Beginner') : skillObj.level;
                    const progress = typeof skillObj === 'string' ? (index % 3 === 0 ? 80 : index % 3 === 1 ? 50 : 30) : skillObj.progress;
                    const status = typeof skillObj === 'string' ? 'Not tested' : skillObj.status;
                    
                    let desc = (typeof skillObj === 'object' && skillObj.description) ? skillObj.description : 'Custom skill manually added to profile.';
                    if ((!skillObj.description) && dbSkill) {
                        if (level === 'Advanced') desc = dbSkill.advanced_criteria;
                        else if (level === 'Intermediate') desc = dbSkill.intermediate_criteria;
                        else desc = dbSkill.beginner_criteria;
                    }
                    
                    let components = (typeof skillObj === 'object' && skillObj.components) ? skillObj.components : [];
                    if ((!components || components.length === 0) && dbSkill && dbSkill.key_components) {
                        components = dbSkill.key_components;
                    }

                    return {
                        name: skillName,
                        progress: progress,
                        status: status,
                        level: level,
                        category: (typeof skillObj === 'object' && skillObj.category) ? skillObj.category : (dbSkill ? dbSkill.category : 'Custom'),
                        description: desc,
                        components: components
                    };
                });
                
                setSkills(formattedUserSkills);
            } catch (error) {
                console.error("Failed to load skills:", error);
            }
        };
        loadData();
    }, [user?.email]);

    const saveSkillsToProfile = async (updatedSkillNames) => {
        if (!user || !user.email) return;
        try {
            // Grab the freshest profile first so we don't wipe out other fields
            const res = await fetch(`http://localhost:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
            if (!res.ok) throw new Error("Could not fetch profile");
            const profileData = await res.json();
            
            // Assign the new skills list
            profileData.skills = updatedSkillNames;
            
            await fetch('http://127.0.0.1:8000/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            console.error("Failed to save skills:", error);
            alert("Database Error: We couldn't find your profile in the system. It's possible your account was deleted. Please Log Out and Register a new account to save your skills permanently!");
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (checkedSkills.length === 0) {
            setShowAddForm(false);
            return;
        }

        let newSkillsList = [...skills];
        let changed = false;

        checkedSkills.forEach(skillName => {
            // Prevent duplicates
            if (newSkillsList.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
                return;
            }

            const dbSkill = dbSkillsList.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
            let desc = 'Custom skill manually added to profile.';
            if (dbSkill) {
                if (newLevel === 'Advanced') desc = dbSkill.advanced_criteria;
                else if (newLevel === 'Intermediate') desc = dbSkill.intermediate_criteria;
                else desc = dbSkill.beginner_criteria;
            }

            const skillToAdd = {
                name: dbSkill ? dbSkill.skill_name : skillName,
                progress: newLevel === 'Beginner' ? 30 : newLevel === 'Intermediate' ? 60 : 90,
                status: 'Not tested',
                level: newLevel,
                category: dbSkill ? dbSkill.category : 'Custom',
                description: desc,
                components: dbSkill && dbSkill.key_components ? dbSkill.key_components : []
            };
            newSkillsList = [skillToAdd, ...newSkillsList];
            changed = true;
        });

        if (changed) {
            setSkills(newSkillsList);
            setCheckedSkills([]);
            setShowAddForm(false);
            
            // Persist addition to backend
            await saveSkillsToProfile(newSkillsList.map(s => ({
                name: s.name, level: s.level, progress: s.progress, status: s.status,
                description: s.description, components: s.components, category: s.category
            })));
        } else {
            setCheckedSkills([]);
            setShowAddForm(false);
        }
    };

    const handleCheckboxChange = (skillName, isChecked) => {
        if (isChecked) {
            setCheckedSkills(prev => [...prev, skillName]);
        } else {
            setCheckedSkills(prev => prev.filter(name => name !== skillName));
        }
    };

    // Group available skills dynamically by major
    const skillsByMajor = dbSkillsList.reduce((acc, skill) => {
        const majorKey = skill.major || 'Other';
        if (!acc[majorKey]) acc[majorKey] = [];
        acc[majorKey].push(skill);
        return acc;
    }, {});
    const availableMajors = Object.keys(skillsByMajor);
    const currentMajor = availableMajors.includes(selectedMajor) ? selectedMajor : (availableMajors[0] || 'Software Engineering');

    const handleRemoveSkill = async (name) => {
        const newSkillsList = skills.filter(s => s.name !== name);
        setSkills(newSkillsList);
        
        // Persist removal to backend
        await saveSkillsToProfile(newSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));
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
                        <form onSubmit={handleAddSkill} className="add-skill-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>IT Specialization</label>
                                    <select
                                        value={currentMajor}
                                        onChange={(e) => setSelectedMajor(e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-input-bg)' }}
                                    >
                                        {availableMajors.map(major => (
                                            <option key={major} value={major}>{major}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Target Proficiency Level</label>
                                    <select
                                        value={newLevel}
                                        onChange={(e) => setNewLevel(e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'var(--color-input-bg)' }}
                                    >
                                        <option value="Beginner">Beginner (30%)</option>
                                        <option value="Intermediate">Intermediate (60%)</option>
                                        <option value="Advanced">Advanced (90%)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', display: 'block' }}>Select Skills to Add</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem', background: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                    {skillsByMajor[currentMajor]?.map(skill => {
                                        const isAlreadyOwned = skills.some(s => s.name.toLowerCase() === skill.skill_name.toLowerCase());
                                        const isChecked = checkedSkills.includes(skill.skill_name);
                                        return (
                                            <label key={skill.skill_name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isAlreadyOwned ? 'not-allowed' : 'pointer', opacity: isAlreadyOwned ? 0.5 : 1 }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isAlreadyOwned ? true : isChecked}
                                                    disabled={isAlreadyOwned}
                                                    onChange={(e) => handleCheckboxChange(skill.skill_name, e.target.checked)}
                                                    style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text)' }}>{skill.skill_name}</span>
                                            </label>
                                        );
                                    })}
                                    {(!skillsByMajor[currentMajor] || skillsByMajor[currentMajor].length === 0) && (
                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No skills found for this specialization.</span>
                                    )}
                                </div>
                            </div>
                            
                            <Button type="submit" disabled={checkedSkills.length === 0} style={{ alignSelf: 'flex-end', minWidth: '200px', opacity: checkedSkills.length === 0 ? 0.5 : 1 }}>
                                Add {checkedSkills.length > 0 ? checkedSkills.length : ''} Skill{checkedSkills.length !== 1 ? 's' : ''}
                            </Button>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <span className="match-badge" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                            {skill.level}
                                        </span>
                                        <span className={`status ${getStatusClass(skill.status)}`} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {getStatusIcon(skill.status)} {skill.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                                        {skill.description}
                                    </p>
                                    {skill.components && skill.components.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                                            {skill.components.map((c, i) => (
                                                <span key={i} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}>
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    )}
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
                                    <Button 
                                        variant="outline" 
                                        className="btn-full" 
                                        style={{ fontSize: '0.8125rem' }}
                                        onClick={() => navigate(`/assessment?skill=${encodeURIComponent(skill.name)}`)}
                                    >
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
