import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { 
    Code2, UploadCloud, CheckCircle2, AlertCircle, ChevronLeft, 
    FileText, Loader2, Sparkles, Lightbulb, Plus, Clock, Info, Trash2
} from 'lucide-react';
import { getEvaluationForSkill, getShortEvaluationForSkill } from '../data/evaluationQuestions';

export const Assessment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getCurrentUser() || {};
    
    // Determine the view mode from URL params
    const query = new URLSearchParams(location.search);
    const activeSkillName = query.get('skill');

    // === HUB STATE ===
    const [skills, setSkills] = useState([]);
    const [dbSkillsList, setDbSkillsList] = useState([]);
    const [checkedSkills, setCheckedSkills] = useState([]);
    const [userMajor, setUserMajor] = useState(user.major || null);
    const [newLevel, setNewLevel] = useState('Beginner');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('technical');
    const [activeShortTest, setActiveShortTest] = useState(null);
    const [shortTestSelection, setShortTestSelection] = useState(null);
    const [softSkillAnswers, setSoftSkillAnswers] = useState({}); // { skillName: optionIndex }
    const [shortTestResult, setShortTestResult] = useState(null);

    // === EVALUATION STATE ===
    const [skillDetails, setSkillDetails] = useState(null);
    const [evaluationData, setEvaluationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!user || !user.email) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch current user's profile first to get specialization
                const profileRes = await fetch(`http://127.0.0.1:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
                let userSkillNames = [];
                let pulledMajor = null;
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    userSkillNames = profileData.skills || [];
                    pulledMajor = profileData.major ? profileData.major.trim() : null;
                    setUserMajor(pulledMajor);
                    console.log("[Assessment] User major from DB:", pulledMajor);
                }

                // Fetch ALL skills (for skill detail lookups)
                const skillsRes = await fetch('http://127.0.0.1:8000/api/skills');
                const allDbSkills = skillsRes.ok ? await skillsRes.json() : [];

                // Fetch skills filtered server-side by specialization (more reliable)
                let specializedSkills = [];
                if (pulledMajor && pulledMajor !== 'Not specified') {
                    const specRes = await fetch(
                        `http://127.0.0.1:8000/api/skills/by-specialization?major=${encodeURIComponent(pulledMajor)}`
                    );
                    specializedSkills = specRes.ok ? await specRes.json() : [];
                    console.log(`[Assessment] Skills for "${pulledMajor}":`, specializedSkills.length, specializedSkills.map(s => s.skill_name));
                }

                // Merge: use specializedSkills for the modal, allDbSkills for detail lookups
                // Store both lists in state
                setDbSkillsList(specializedSkills.length > 0 ? specializedSkills : allDbSkills);

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

                    return {
                        name: skillName,
                        progress: progress,
                        status: status,
                        level: level,
                        category: (typeof skillObj === 'object' && skillObj.category) ? skillObj.category : (dbSkill ? dbSkill.category : 'Custom'),
                        description: desc,
                        components: (typeof skillObj === 'object' && skillObj.components) ? skillObj.components : (dbSkill?.key_components || [])
                    };
                });
                
                setSkills(formattedUserSkills);

                // If verifying a specific skill, find its metadata
                if (activeSkillName) {
                    const match = allDbSkills.find(s => s.skill_name.toLowerCase() === activeSkillName.toLowerCase());
                    setSkillDetails({
                        ...match,
                        name: activeSkillName,
                        category: match ? match.category : 'Custom'
                    });
                    setEvaluationData(getEvaluationForSkill(activeSkillName, match ? match.category : ''));
                }

            } catch (error) {
                console.error("Failed to load skills:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.email, activeSkillName]);

    const saveSkillsToProfile = async (updatedSkillNames) => {
        if (!user || !user.email) return;
        try {
            const res = await fetch(`http://localhost:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
            if (!res.ok) throw new Error("Could not fetch profile");
            const profileData = await res.json();
            
            profileData.skills = updatedSkillNames;
            
            await fetch('http://127.0.0.1:8000/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            console.error("Failed to save skills:", error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // --- HUB FUNCTIONS ---

    const startShortTest = (skillName, category) => {
        const questionObj = getShortEvaluationForSkill(skillName, category);
        setActiveShortTest({ name: skillName, category, questionObj });
        setShortTestSelection(null);
    };

    const submitShortTest = async () => {
        if (shortTestSelection === null || !activeShortTest) return;

        const { name, category } = activeShortTest;
        const selectedOption = activeShortTest.questionObj.options[shortTestSelection];

        let newSkillsList = [...skills];
        
        let dbMatch = null;
        if (category !== 'Soft') {
            dbMatch = dbSkillsList.find(s => s.skill_name.toLowerCase() === name.toLowerCase());
        }

        // Canonical name — always the human-readable skill name, used as the key everywhere
        const canonicalName = dbMatch ? dbMatch.skill_name : name;

        let desc = category === 'Soft' 
            ? `Soft skill evaluated via AI case-study.` 
            : 'Technical skill assessed via AI placement test.';
            
        if (dbMatch) {
            if (selectedOption.level === 'Advanced') desc = dbMatch.advanced_criteria;
            else if (selectedOption.level === 'Intermediate') desc = dbMatch.intermediate_criteria;
            else desc = dbMatch.beginner_criteria;
        }

        const skillToAdd = {
            name: canonicalName,
            progress: selectedOption.points,
            status: 'Not tested',
            level: selectedOption.level,
            category: dbMatch ? dbMatch.category : category,
            description: desc,
            components: dbMatch && dbMatch.key_components ? dbMatch.key_components : []
        };
        
        newSkillsList = newSkillsList.filter(s => s.name.toLowerCase() !== name.toLowerCase());
        newSkillsList = [skillToAdd, ...newSkillsList];

        // Save profile first
        await saveSkillsToProfile(newSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));

        // Save assessment result record — always use canonical skill name as skillId
        try {
            await fetch('http://127.0.0.1:8000/api/assessment/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id || user?.email || "unknown",
                    skillId: canonicalName,
                    skillName: canonicalName,
                    category: category,
                    answers: selectedOption.text,
                    aiScore: selectedOption.points,
                    level: selectedOption.level,
                    status: "completed",
                    completedAt: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error("Failed to save assessment result:", e);
        }

        // Update UI state after saves complete
        setSkills(newSkillsList);
        setShortTestResult(skillToAdd);
        setActiveShortTest(null);
    };


    const handleRemoveSkill = async (name) => {
        const newSkillsList = skills.filter(s => s.name !== name);
        setSkills(newSkillsList);
        await saveSkillsToProfile(newSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));
    };

    const handleCheckboxChange = (skillName, isChecked) => {
        if (isChecked) setCheckedSkills(prev => [...prev, skillName]);
        else setCheckedSkills(prev => prev.filter(name => name !== skillName));
    };

    // availableSkills: already pre-filtered server-side via /api/skills/by-specialization
    // Apply a loose client-side fallback filter just in case the list contains mixed majors
    const availableSkills = dbSkillsList.filter(skill => {
        if (!skill.skill_name) return false;  // ensure it's a valid skill doc
        if (!userMajor) return true;          // if no major set, show all (shouldn't happen)
        if (!skill.major) return true;         // if skill has no major, keep it
        return skill.major.trim().toLowerCase().includes(userMajor.trim().toLowerCase()) ||
               userMajor.trim().toLowerCase().includes(skill.major.trim().toLowerCase());
    });
    console.log("[Assessment] availableSkills count:", availableSkills.length);

    const SOFT_SKILLS = ["Communication", "Teamwork", "Problem Solving", "Adaptability"];
    const unevaluatedSoftSkills = SOFT_SKILLS.filter(
        ss => !skills.some(s => s.name.toLowerCase() === ss.toLowerCase())
    );
    const allSoftAnswered = unevaluatedSoftSkills.length > 0 &&
        unevaluatedSoftSkills.every(ss => softSkillAnswers[ss] !== undefined);

    const submitAllSoftSkills = async () => {
        if (!allSoftAnswered) return;

        let newSkillsList = [...skills];
        const completedAt = new Date().toISOString();

        for (const softSkillName of unevaluatedSoftSkills) {
            const questionObj = getShortEvaluationForSkill(softSkillName, 'Soft');
            const selectedIdx = softSkillAnswers[softSkillName];
            const selectedOption = questionObj.options[selectedIdx];

            newSkillsList = newSkillsList.filter(s => s.name.toLowerCase() !== softSkillName.toLowerCase());
            newSkillsList = [{
                name: softSkillName,
                progress: selectedOption.points,
                status: 'Not tested',
                level: selectedOption.level,
                category: 'Soft',
                description: `Soft skill evaluated via AI case-study.`,
                components: []
            }, ...newSkillsList];
        }

        // Save all to profile at once
        await saveSkillsToProfile(newSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));

        // Save each assessment result record to MongoDB
        for (const softSkillName of unevaluatedSoftSkills) {
            const questionObj = getShortEvaluationForSkill(softSkillName, 'Soft');
            const selectedOption = questionObj.options[softSkillAnswers[softSkillName]];
            try {
                await fetch('http://127.0.0.1:8000/api/assessment/result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.id || user?.email || "unknown",
                        skillId: softSkillName,
                        skillName: softSkillName,
                        category: 'Soft',
                        answers: selectedOption.text,
                        aiScore: selectedOption.points,
                        level: selectedOption.level,
                        status: "completed",
                        completedAt
                    })
                });
            } catch (e) {
                console.error(`Failed to save soft skill result for ${softSkillName}:`, e);
            }
        }

        // Update UI
        setSkills(newSkillsList);
        setSoftSkillAnswers({});
        setIsModalOpen(false);
    };

    const handleSubmitAssessment = async () => {
        if (!submission.trim() || !activeSkillName) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/api/user/assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    skill_name: activeSkillName,
                    submission: submission,
                    expected_keywords: evaluationData?.keywords || []
                })
            });
            const data = await response.json();
            
            await fetch('http://127.0.0.1:8000/api/assessment/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id || user?.email || "unknown",
                    skillId: activeSkillName,
                    answers: submission,
                    aiScore: data.score || 0,
                    status: "completed",
                    completedAt: new Date().toISOString()
                })
            });
            
            setResult(data);
        } catch (err) {
            console.error("Submission failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetEvaluation = () => {
        setResult(null);
        setSubmission('');
        navigate('/assessment'); // Removes query param, returns to hub
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

    // ============================================
    // RENDER: HUB VIEW
    // ============================================
    if (!activeSkillName) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div className="skills-page-container">
                    <div className="section-header" style={{ marginBottom: '2rem', display: 'block' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Assessment Hub</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Select skills to add to your profile and begin testing your proficiency.</p>
                    </div>

                    <section className="dashboard-section" style={{ marginBottom: '2.5rem' }}>
                        <div className="section-header">
                            <h3>Your Managed Skills</h3>
                            <Button
                                variant="primary"
                                onClick={() => setIsModalOpen(true)}
                                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={18} /> Add Skills
                            </Button>
                        </div>

                        {isModalOpen && (
                            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                <div className="animate-fade-in" style={{ backgroundColor: 'var(--color-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                                        {shortTestResult ? 'Assessment Complete' : activeShortTest ? `AI Assessment: ${activeShortTest.name}` : 'Add New Skills'}
                                    </h3>
                                    
                                    {shortTestResult ? (
                                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                            <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 1.5rem auto' }} />
                                            <div style={{ background: 'var(--color-bg-paper)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', margin: '1.5rem 0' }}>
                                                <h5 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{shortTestResult.name}</h5>
                                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{shortTestResult.progress}%</div>
                                                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'var(--color-white)', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: '600', border: '1px solid var(--color-border)' }}>
                                                    Assessed Level: {shortTestResult.level}
                                                </div>
                                                <p style={{ marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                                                    Your AI assessment score has been saved to your profile.<br />
                                                    Want to officially verify this skill? Take the deep-dive evaluation.
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                                                <Button variant="outline" onClick={() => { setShortTestResult(null); setIsModalOpen(false); }}>Close</Button>
                                                <Button onClick={() => { 
                                                    setShortTestResult(null); 
                                                    setIsModalOpen(false); 
                                                    navigate(`/assessment?skill=${encodeURIComponent(shortTestResult.name)}`); 
                                                }}>
                                                    Complete Full Assessment
                                                </Button>
                                            </div>
                                        </div>
                                    ) : activeShortTest ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ background: 'var(--color-bg-paper)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-primary)' }}>
                                                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6 }}>
                                                    {activeShortTest.questionObj.question}
                                                </p>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {activeShortTest.questionObj.options.map((option, idx) => (
                                                    <label 
                                                        key={idx} 
                                                        style={{ 
                                                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1.25rem', 
                                                            borderRadius: 'var(--radius-sm)', border: shortTestSelection === idx ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', 
                                                            background: shortTestSelection === idx ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-white)', cursor: 'pointer', transition: 'all 0.2s' 
                                                        }}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            name="assessment_option" 
                                                            checked={shortTestSelection === idx}
                                                            onChange={() => setShortTestSelection(idx)}
                                                            style={{ marginTop: '0.25rem', width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-primary)' }}
                                                        />
                                                        <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--color-text)' }}>{option.text}</span>
                                                    </label>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                                <Button variant="outline" onClick={() => setActiveShortTest(null)}>Cancel</Button>
                                                <Button onClick={submitShortTest} disabled={shortTestSelection === null}>
                                                    Submit & Evaluate
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                                                <button 
                                                    onClick={() => setActiveTab('technical')}
                                                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'technical' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'technical' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    Technical Skills
                                                </button>
                                                <button 
                                                    onClick={() => setActiveTab('soft')}
                                                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'soft' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'soft' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    Soft Skills
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {activeTab === 'technical' && (
                                                    <div>
                                                        {!userMajor ? (
                                                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                                                <AlertCircle size={40} color="var(--color-warning)" style={{ margin: '0 auto 1rem auto' }} />
                                                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Specialization Required</h4>
                                                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                                                                    You must select an IT Specialization in your profile to access matched assessments.
                                                                </p>
                                                                <Button onClick={() => window.location.href='/profile'}>Update Profile Details</Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                                                                    <div>
                                                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Auto-detected Specialization:</span>
                                                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: '0.25rem' }}>{userMajor}</div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div>
                                                                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Select a technical skill to take a short placement test.</p>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                                                                        {availableSkills.map(skill => {
                                                                            const isAlreadyOwned = skills.some(s => s.name.toLowerCase() === skill.skill_name.toLowerCase());
                                                                            return (
                                                                                <button 
                                                                                    key={skill.skill_name} 
                                                                                    onClick={() => !isAlreadyOwned && startShortTest(skill.skill_name, skill.category)}
                                                                                    disabled={isAlreadyOwned}
                                                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '1rem', background: 'var(--color-white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: isAlreadyOwned ? 'not-allowed' : 'pointer', opacity: isAlreadyOwned ? 0.6 : 1, textAlign: 'left', width: '100%', transition: 'border 0.2s' }}
                                                                                >
                                                                                    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--color-text)' }}>{skill.skill_name}</span>
                                                                                    {isAlreadyOwned ? <CheckCircle2 size={16} color="var(--color-success)" /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--color-primary)' }} />}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                        {availableSkills.length === 0 && (
                                                                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No skills found for your specialization.</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {activeTab === 'soft' && (
                                                    <div>
                                                        {unevaluatedSoftSkills.length === 0 ? (
                                                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                                <CheckCircle2 size={40} color="var(--color-success)" style={{ margin: '0 auto 1rem auto' }} />
                                                                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>All soft skills have been evaluated!</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                                                    Answer all {unevaluatedSoftSkills.length} scenario{unevaluatedSoftSkills.length > 1 ? 's' : ''} below, then click <strong>Submit All</strong> to save your results.
                                                                </p>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                                    {SOFT_SKILLS.map(softSkill => {
                                                                        const isAlreadyOwned = skills.some(s => s.name.toLowerCase() === softSkill.toLowerCase());
                                                                        if (isAlreadyOwned) {
                                                                            return (
                                                                                <div key={softSkill} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--color-white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', opacity: 0.6 }}>
                                                                                    <CheckCircle2 size={18} color="var(--color-success)" />
                                                                                    <span style={{ fontWeight: 600 }}>{softSkill}</span>
                                                                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Already evaluated</span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        const questionObj = getShortEvaluationForSkill(softSkill, 'Soft');
                                                                        return (
                                                                            <div key={softSkill} style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                                                                                <div style={{ background: 'var(--color-primary)', padding: '0.75rem 1.25rem' }}>
                                                                                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{softSkill}</span>
                                                                                </div>
                                                                                <div style={{ padding: '1.25rem', background: 'var(--color-bg-paper)', borderBottom: '1px solid var(--color-border)' }}>
                                                                                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--color-text)' }}>
                                                                                        {questionObj.question}
                                                                                    </p>
                                                                                </div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--color-white)' }}>
                                                                                    {questionObj.options.map((option, idx) => (
                                                                                        <label
                                                                                            key={idx}
                                                                                            style={{
                                                                                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.9rem 1rem',
                                                                                                borderRadius: 'var(--radius-sm)',
                                                                                                border: softSkillAnswers[softSkill] === idx ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                                                                background: softSkillAnswers[softSkill] === idx ? 'rgba(59,130,246,0.05)' : 'transparent',
                                                                                                cursor: 'pointer', transition: 'all 0.15s'
                                                                                            }}
                                                                                        >
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`soft_${softSkill}`}
                                                                                                checked={softSkillAnswers[softSkill] === idx}
                                                                                                onChange={() => setSoftSkillAnswers(prev => ({ ...prev, [softSkill]: idx }))}
                                                                                                style={{ marginTop: '0.2rem', accentColor: 'var(--color-primary)' }}
                                                                                            />
                                                                                            <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{option.text}</span>
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                                                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                                                    <Button onClick={submitAllSoftSkills} disabled={!allSoftAnswered}>
                                                                        Submit All ({Object.keys(softSkillAnswers).length}/{unevaluatedSoftSkills.length} answered)
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="jobs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                {skills.map((skill, index) => (
                                    <div key={`${skill.name}-${index}`} className="job-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{skill.name}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                    <span className="match-badge" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                                        {skill.level}
                                                    </span>
                                                    <span className={`status ${skill.status === 'Verified' ? 'verified' : (skill.status === 'Pending' ? 'pending' : 'unverified')}`} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {skill.status === 'Verified' ? <CheckCircle2 size={14} className="check-icon" /> : <Clock size={14} style={{ color: skill.status === 'Pending' ? '#F59E0B' : 'var(--color-text-muted)' }} />}
                                                        {skill.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveSkill(skill.name)}
                                                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.5rem' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="skill-item" style={{ marginBottom: '1rem' }}>
                                            <div className="skill-info" style={{ marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>AI Evaluation</span>
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
                                                    Complete Assessment
                                                </Button>
                                            )}
                                            {skill.status === 'Verified' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.875rem', fontWeight: '600', width: '100%', justifyContent: 'center', padding: '0.5rem', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-md)' }}>
                                                    <CheckCircle2 size={16} /> Strongly Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {skills.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>No skills selected for assessment yet.</p>
                                        <Button onClick={() => setIsModalOpen(true)} style={{ marginTop: '1.5rem' }}>+ Add Your First Skill</Button>
                                    </div>
                                )}
                            </div>
                    </section>
                </div>
                <style>{`
                    .pending { color: #F59E0B; }
                    .unverified { color: var(--color-text-muted); }
                `}</style>
            </DashboardLayout>
        );
    }

    // ============================================
    // RENDER: EVALUATION VIEW
    // ============================================
    if (!skillDetails || !evaluationData) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--color-error)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                    <h3>Assessment Not Configured</h3>
                    <p>There are no evaluation questions mapped to {activeSkillName}.</p>
                    <Button onClick={() => navigate('/assessment')} style={{ marginTop: '1rem' }}>Back to Hub</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="dashboard-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => navigate('/assessment')}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}
                    >
                        <ChevronLeft size={16} /> Back to Hub
                    </button>
                </div>

                <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Skill Assessment</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            {activeSkillName} • {skillDetails.category}
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
                                    width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', 
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <FileText size={24} />
                                </div>
                                <h3 style={{ margin: 0 }}>Practical Scenario Task</h3>
                            </div>

                            <div style={{ 
                                background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', 
                                marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' 
                            }}>
                                <p style={{ margin: 0, lineHeight: 1.6, fontWeight: 500, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                                    {evaluationData.question}
                                </p>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <textarea 
                                    className="form-control"
                                    placeholder="Write your detailed, scenario-based answer here. Assume you are communicating with senior engineers..."
                                    style={{ 
                                        minHeight: '250px', width: '100%', padding: '1.25rem', fontFamily: 'system-ui, sans-serif', 
                                        fontSize: '1rem', lineHeight: 1.6, borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)', resize: 'vertical'
                                    }}
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                />
                                <div style={{ 
                                    position: 'absolute', bottom: '1rem', right: '1.5rem', 
                                    color: 'var(--color-text-muted)', fontSize: '0.85rem'
                                }}>
                                    {submission.length} characters
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button className="btn-primary" style={{ padding: '0.75rem 2.5rem' }} onClick={handleSubmitAssessment} disabled={!submission || isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Submit Assessment'}
                                </Button>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
                                    <Sparkles size={18} color="#eab308" /> Evaluation Criteria
                                </h4>
                                <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                    <li>Provide real-world context</li>
                                    <li>Use proper technical vocabulary</li>
                                    <li>Explain your complete flow</li>
                                    <li>Minimum 150 characters expected</li>
                                </ul>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', border: 'none', borderRadius: 'var(--radius-xl)', padding: '1.5rem', color: 'white' }}>
                                <h4 style={{ marginTop: 0 }}>Pro Tip</h4>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
                                    Generic or purely theoretical answers will yield a lower score. Provide an exact scenario or structure to achieve a Verified status.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Result Section */
                    <div className="animate-fade-in" style={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ width: '80px', height: '80px', background: result.status === 'Verified' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: result.status === 'Verified' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                            {result.status === 'Verified' ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                        </div>
                        
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            Score: {result.score}% ({result.level})
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto 2.5rem auto', fontWeight: 500, fontSize: '1.1rem' }}>
                            {result.status === 'Verified' 
                                ? 'Congratulations! You successfully demonstrated your proficiency.' 
                                : 'Your submission is a great start, but it needs a bit more detail to verify.'}
                        </p>

                        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '24px', padding: '2.5rem', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                <Lightbulb size={120} color="var(--color-primary)" />
                            </div>
                            
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: 'var(--color-primary)' }}>
                                <Sparkles size={20} /> Evaluation Feedback
                            </h4>
                            <p style={{ lineHeight: 1.7, color: 'var(--color-text)', fontSize: '1.05rem', margin: '1rem 0 0 0', position: 'relative', zIndex: 1 }}>
                                {result.suggestion}
                            </p>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <Button variant="outline" onClick={resetEvaluation}>Take Again</Button>
                            <Button className="btn-primary" onClick={() => navigate('/assessment')}>Return to Hub</Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
