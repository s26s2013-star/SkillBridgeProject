import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { authService } from '../services/authService';
import { Wrench, BookOpen, Layers, Target, ChevronRight, AlertCircle, X } from 'lucide-react';
import { Button } from '../components/Button';

export const Skills = () => {
    const navigate = useNavigate();
    
    // Read auth state once
    const user = authService.getCurrentUser();
    const userEmail = user?.email;
    
    const [data, setData] = useState({ major: null, skills: [] });
    const [loading, setLoading] = useState(true);
    const [selectedSkill, setSelectedSkill] = useState(null);

    // Single fetch request
    useEffect(() => {
        if (!userEmail) {
            navigate('/login');
            return;
        }

        let isMounted = true;
        
        const fetchAllSkillsSingleRequest = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/skills/for-user?email=${encodeURIComponent(userEmail)}`);
                if (res.ok && isMounted) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to load skills info side:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllSkillsSingleRequest();
        return () => { isMounted = false; };
    }, [userEmail, navigate]);

    // Prevent recalculations 
    const technicalSkills = useMemo(() => data.skills.filter(s => s.type?.toLowerCase() === 'technical'), [data.skills]);
    const softSkills = useMemo(() => data.skills.filter(s => s.type?.toLowerCase() === 'soft'), [data.skills]);

    const renderSkillCard = (skill) => {
        return (
            <div key={skill.id} className="simple-card" onClick={() => setSelectedSkill(skill)}>
                <div className="card-header-area">
                    <div style={{ marginBottom: '1rem' }}>
                        <span className={`simple-badge ${skill.type?.toLowerCase() === 'technical' ? 'badge-tech' : 'badge-soft'}`}>
                            {skill.type || 'Skill'}
                        </span>
                        <h4 className="card-title">{skill.name}</h4>
                        <p className="card-desc">
                            {skill.shortDescription || "Core competency for this specialization."}
                        </p>
                    </div>

                    <div className="card-footer">
                        <span className="read-more-text">Read More</span>
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout user={user || {}} onLogout={() => authService.logout()}>
            <style>{`
                .skills-page-container {
                    padding-bottom: 4rem;
                    max-width: 1000px;
                }
                .page-header {
                    margin-bottom: 3rem;
                    border-bottom: 1px solid var(--color-border);
                    padding-bottom: 1rem;
                }
                .page-title {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: var(--color-text);
                    margin-bottom: 0.5rem;
                }
                .page-subtitle {
                    color: var(--color-text-muted);
                    font-size: 1rem;
                    line-height: 1.5;
                }
                
                /* Simple Cards */
                .simple-card {
                    background: var(--color-bg);
                    border: 1px solid var(--color-border);
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .simple-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    border-color: rgba(59, 130, 246, 0.2);
                }
                
                .card-header-area {
                    padding: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                
                .card-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-text);
                    margin-bottom: 0.6rem;
                    line-height: 1.3;
                }
                .card-desc {
                    font-size: 0.95rem;
                    color: var(--color-text-muted);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    margin: 0;
                }
                
                .card-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--color-primary);
                    opacity: 0.8;
                    transition: opacity 0.2s;
                    border-top: 1px solid transparent;
                }
                .simple-card:hover .card-footer {
                    opacity: 1;
                }
                .read-more-text {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                
                /* Badges */
                .simple-badge {
                    display: inline-block;
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: 0.85rem;
                }
                .badge-tech {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--color-primary);
                }
                .badge-soft {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--color-success);
                }

                .section-header-simple {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid var(--color-border);
                }
                .section-header-simple h3 {
                    font-size: 1.4rem;
                    color: var(--color-text);
                    margin: 0;
                    font-weight: 600;
                }

                /* Center Modal Styling */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.45); /* Soft dark overlay */
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                }
                .modal-content {
                    background-color: var(--color-bg);
                    border-radius: 12px;
                    width: 100%;
                    max-width: 600px; /* Medium size */
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: modal-fade-in 0.2s ease-out;
                }
                @keyframes modal-fade-in {
                    from { opacity: 0; transform: scale(0.98) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .modal-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--color-text);
                    margin: 0;
                }
                .modal-close {
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .modal-close:hover {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-text);
                }
                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                }
                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--color-border);
                }

                /* Modal Details Content */
                .components-area {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-bottom: 1.5rem;
                }
                .component-tag {
                    background: var(--color-bg-paper);
                    border: 1px solid var(--color-border);
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                }
                .detail-panel {
                    margin-bottom: 1.25rem;
                }
                .detail-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--color-text);
                    margin: 0 0 0.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .detail-text {
                    font-size: 0.95rem;
                    color: var(--color-text-muted);
                    line-height: 1.5;
                    margin: 0;
                }
                .progression-block {
                    padding-bottom: 0.75rem;
                    margin-bottom: 0.75rem;
                    border-bottom: 1px solid var(--color-border);
                }
                .progression-block h6 {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--color-text);
                    margin: 0 0 0.25rem 0;
                    text-transform: uppercase;
                }
                .progression-block p {
                    font-size: 0.95rem;
                    color: var(--color-text-muted);
                    margin: 0;
                    line-height: 1.4;
                }
                .assessment-panel {
                    background: rgba(59, 130, 246, 0.04);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }
                .assessment-panel h5 {
                    color: var(--color-primary);
                    margin: 0 0 0.4rem 0;
                    font-size: 0.95rem;
                }
                .assessment-panel p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--color-text-muted);
                    line-height: 1.4;
                }
            `}</style>
            
            <div className="skills-page-container">
                <div className="page-header">
                    <h2 className="page-title">Specialization Directory</h2>
                    <p className="page-subtitle">
                        An overview of the core technical and soft skills required for your chosen IT Specialization.
                    </p>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Loading specialized skills...</p>
                    </div>
                ) : !data.major || data.major === 'Not specified' ? (
                    <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                        <AlertCircle size={48} color="var(--color-warning)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 600 }}>Specialization Required</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                            Update your profile with an IT Specialization to view required competencies.
                        </p>
                        <Button className="btn-primary" onClick={() => navigate('/profile')}>Complete Profile</Button>
                    </div>
                ) : data.skills.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--color-bg)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                        <Wrench size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600 }}>No Skills Mapped</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>We couldn't find standardized competencies for "{data.major}".</p>
                    </div>
                ) : (
                    <>
                        {technicalSkills.length > 0 && (
                            <div style={{ marginBottom: '3rem' }}>
                                <div className="section-header-simple">
                                    <Layers color="var(--color-primary)" size={22} />
                                    <h3>Technical Expertise</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                                    {technicalSkills.map((skill) => renderSkillCard(skill))}
                                </div>
                            </div>
                        )}

                        {softSkills.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div className="section-header-simple">
                                    <Target color="var(--color-success)" size={22} />
                                    <h3>Core Soft Skills</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                                    {softSkills.map((skill) => renderSkillCard(skill))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Centered Medium Modal */}
            {selectedSkill && (
                <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <div>
                                <span className={`simple-badge ${selectedSkill.type?.toLowerCase() === 'technical' ? 'badge-tech' : 'badge-soft'}`} style={{ marginBottom: '0.5rem' }}>
                                    {selectedSkill.type || 'Skill'}
                                </span>
                                <h3 className="modal-title">{selectedSkill.name}</h3>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedSkill(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {selectedSkill.details?.components?.length > 0 && (
                                <div className="components-area">
                                    {selectedSkill.details.components.map((kc, i) => (
                                        <span key={i} className="component-tag">{kc}</span>
                                    ))}
                                </div>
                            )}

                            <div className="detail-panel">
                                <h5 className="detail-title"><BookOpen size={16} /> Why this is important</h5>
                                <p className="detail-text">
                                    {selectedSkill.details?.importance || `This is a foundational competency for any professional in ${data.major}.`}
                                </p>
                            </div>
                            
                            <div className="detail-panel">
                                <h5 className="detail-title"><Target size={16} /> Mastery Progression</h5>
                                <div className="progression-block">
                                    <h6>Intermediate</h6>
                                    <p>{selectedSkill.details?.intermediate || "Focus on independently handling tasks and improving efficiency."}</p>
                                </div>
                                <div className="progression-block" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                                    <h6>Advanced</h6>
                                    <p>{selectedSkill.details?.advanced || "Focus on architectural design, strategy, and mentoring others."}</p>
                                </div>
                            </div>

                            {selectedSkill.details?.assessment && (
                                <div className="assessment-panel">
                                    <h5>Assessment Context</h5>
                                    <p>{selectedSkill.details.assessment}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <Button 
                                className="btn-primary"
                                style={{ width: '100%', fontSize: '1rem', padding: '0.6rem 0' }}
                                onClick={() => {
                                    const skillName = selectedSkill.name;
                                    setSelectedSkill(null);
                                    navigate(`/assessment?skill=${encodeURIComponent(skillName)}`);
                                }}
                            >
                                Test This Skill
                            </Button>
                        </div>

                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
