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
import { getTechCaseStudyPrompt } from '../data/techCaseStudyPrompts';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('technical');
    const [softSkillAnswers, setSoftSkillAnswers] = useState({}); // { skillName: optionIndex }
    const [shortTestResult, setShortTestResult] = useState(null);

    // === MAJOR ASSESSMENT STATE (Stage 2) ===
    const [majorAssessmentTask, setMajorAssessmentTask] = useState(null);
    const [majorResult, setMajorResult] = useState(null);
    const [majorSubmitting, setMajorSubmitting] = useState(false);
    const [majorLoading, setMajorLoading] = useState(false);

    // === INDIVIDUAL EVALUATION STATE (Stage 3 & 2 shared) ===
    const [skillDetails, setSkillDetails] = useState(null);
    const [evaluationData, setEvaluationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [submissionMode, setSubmissionMode] = useState('quiz');
    const [wantsToReassess, setWantsToReassess] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState(new Array(10).fill(null));
    const [quizLoading, setQuizLoading] = useState(false);

    // === NEW TECHNICAL ASSESSMENT FLOW STATE (Stage 3) ===
    const [techFlowActive, setTechFlowActive] = useState(false);
    const [techQuestions, setTechQuestions] = useState([]);
    const [currentTechIdx, setCurrentTechIdx] = useState(0);
    const [techAnswers, setTechAnswers] = useState({}); // { question_number: selected_option_text }
    const [techResult, setTechResult] = useState(null);
    const [techLoading, setTechLoading] = useState(false);
    const [activeTechSkill, setActiveTechSkill] = useState("");
    const [caseStudyText, setCaseStudyText] = useState("");
    const [caseStudyFile, setCaseStudyFile] = useState(null);

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
                    
                    // Fetch Major Assessment details (Stage 2)
                    setMajorLoading(true);
                    const majorTaskRes = await fetch(`http://127.0.0.1:8000/api/major-assessment?major=${encodeURIComponent(pulledMajor)}`);
                    if (majorTaskRes.ok) {
                        setMajorAssessmentTask(await majorTaskRes.json());
                    }
                    setMajorLoading(false);
                }

                // Set specialized list for hub
                if (pulledMajor && pulledMajor !== 'Not specified') {
                    setDbSkillsList(specializedSkills);
                } else {
                    setDbSkillsList(allDbSkills);
                }

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
                    
                    // Fetch Quiz context (Stage 3)
                    setQuizLoading(true);
                    fetch(`http://127.0.0.1:8000/api/assessment/quiz-questions?skill_name=${encodeURIComponent(activeSkillName)}&category=${encodeURIComponent(match ? match.category : 'Technical')}`)
                        .then(res => res.json())
                        .then(data => {
                            const qs = data.questions || [];
                            setQuizQuestions(qs);
                            setQuizAnswers(new Array(qs.length).fill(null));
                        })
                        .catch(err => console.error("Error fetching quiz:", err))
                        .finally(() => setQuizLoading(false));
                }

            } catch (error) {
                console.error("Failed to load assessment data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.email, activeSkillName, navigate]);

    const saveSkillsToProfile = async (updatedSkillList) => {
        if (!user || !user.email) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/user/profile?email=${encodeURIComponent(user.email)}`);
            if (!res.ok) throw new Error("Could not fetch profile");
            const profileData = await res.json();
            
            profileData.skills = updatedSkillList;
            
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

    // === MAJOR ASSESSMENT FUNCTIONS (Stage 2) ===
    const handleMajorSubmit = async () => {
        if (!userMajor) return;
        setMajorSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('email', user.email);
            formData.append('major', userMajor);
            formData.append('mode', submissionMode);
            
            if (submissionMode === 'file') {
                if (!selectedFile) return;
                formData.append('file', selectedFile);
            } else {
                if (!submission.trim()) return;
                formData.append('submission_text', submission);
            }

            const response = await fetch('http://127.0.0.1:8000/api/major-assessment', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setMajorResult(data);
            } else {
                throw new Error("Assessment submission failed");
            }
        } catch (err) {
            console.error("Major assessment failed:", err);
            alert("Failed to process assessment. Please try again.");
        } finally {
            setMajorSubmitting(false);
        }
    };

    const acceptMajorAssessment = async () => {
        if (!majorResult) return;
        
        const newTechnicalSkills = majorResult.skill_breakdown.map(skill => {
            const dbMatch = dbSkillsList.find(s => s.skill_name.toLowerCase() === skill.name.toLowerCase());
            return {
                name: skill.name,
                progress: skill.score,
                status: skill.status,
                level: skill.level,
                category: 'Technical',
                description: `Verified proficiency via ${userMajor} unified assessment.`,
                components: dbMatch ? dbMatch.key_components : []
            };
        });

        const softSkills = skills.filter(s => s.category === 'Soft');
        const finalSkillsList = [...newTechnicalSkills, ...softSkills];

        await saveSkillsToProfile(finalSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));

        setSkills(finalSkillsList);
        setMajorResult(null);
        setIsModalOpen(false);
        setSubmission('');
        setSelectedFile(null);
        alert(`Successfully verified ${newTechnicalSkills.length} skills!`);
    };

    // === INDIVIDUAL TECHNICAL ASSESSMENT FUNCTIONS (Stage 3) ===
    const startTechnicalAssessment = async (skillName) => {
        setTechLoading(true);
        setActiveTechSkill(skillName);
        try {
            const majorParam = userMajor ? `&major=${encodeURIComponent(userMajor)}` : '';
            const res = await fetch(`http://127.0.0.1:8000/api/technical-questions?skill_name=${encodeURIComponent(skillName)}${majorParam}`);
            const data = await res.json();
            if (data.questions && data.questions.length > 0) {
                setTechQuestions(data.questions);
                setCurrentTechIdx(0);
                setTechAnswers({});
                setTechResult(null);
                setTechFlowActive(true);
            } else {
                alert("No questions found for this skill.");
            }
        } catch (error) {
            console.error("Error fetching technical questions:", error);
        } finally {
            setTechLoading(false);
        }
    };

    const submitTechnicalAssessment = async () => {
        setTechLoading(true);
        try {
            const payload = {
                major: userMajor,
                skill_name: activeTechSkill,
                answers: Object.entries(techAnswers).map(([num, text]) => ({
                    question_number: parseInt(num),
                    selected_option_text: text
                }))
            };

            const res = await fetch('http://127.0.0.1:8000/api/technical-assessment/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const rubricData = await res.json();
            
            const formData = new FormData();
            formData.append('skill_name', activeTechSkill);
            formData.append('case_study_text', caseStudyText);
            if (caseStudyFile) formData.append('file', caseStudyFile);

            const caseStudyRes = await fetch('http://127.0.0.1:8000/api/technical-assessment/case-study', {
                method: 'POST',
                body: formData
            });
            const caseStudyData = await caseStudyRes.json();

            const rubricPercentage = rubricData.percentage || 0;
            const caseStudyPercentage = caseStudyData.case_study_percentage || 0;
            const finalPercentage = (rubricPercentage + caseStudyPercentage) / 2;

            let finalLevel = "Beginner";
            if (finalPercentage >= 85) finalLevel = "Advanced";
            else if (finalPercentage >= 60) finalLevel = "Intermediate";

            const finalResult = {
                ...rubricData,
                rubric_percentage: rubricPercentage,
                case_study_percentage: caseStudyPercentage,
                percentage: Math.round(finalPercentage * 100) / 100,
                level: finalLevel,
                feedback: caseStudyData.feedback || "Evaluation complete."
            };

            setTechResult(finalResult);

            let newSkillsList = [...skills];
            const skillToAdd = {
                name: activeTechSkill,
                progress: finalResult.percentage,
                status: finalPercentage >= 60 ? 'Verified' : 'Pending',
                level: finalLevel,
                category: 'Technical',
                description: `Averaged score from structured rubric (${rubricPercentage}%) and AI case study (${caseStudyPercentage}%).`,
                components: []
            };

            newSkillsList = newSkillsList.filter(s => s.name.toLowerCase() !== activeTechSkill.toLowerCase());
            newSkillsList = [skillToAdd, ...newSkillsList];
            
            setSkills(newSkillsList);
            await saveSkillsToProfile(newSkillsList.map(s => ({
                name: s.name, level: s.level, progress: s.progress, status: s.status,
                description: s.description, components: s.components, category: s.category
            })));

            await fetch('http://127.0.0.1:8000/api/assessment/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.email || "unknown",
                    skillId: activeTechSkill,
                    skillName: activeTechSkill,
                    category: 'Technical',
                    answers: `Final Score: ${finalResult.percentage}%`,
                    aiScore: finalResult.percentage,
                    level: finalLevel,
                    status: "completed",
                    completedAt: new Date().toISOString()
                })
            });

        } catch (error) {
            console.error("Error submitting technical assessment:", error);
        } finally {
            setTechLoading(false);
        }
    };

    // === SOFT SKILL FUNCTIONS ===
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

            try {
                await fetch('http://127.0.0.1:8000/api/assessment/result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.email || "unknown",
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

        await saveSkillsToProfile(newSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));

        setSkills(newSkillsList);
        setSoftSkillAnswers({});
        setIsModalOpen(false);
    };

    // === INDIVIDUAL PAGE EVALUATION SUBMIT (Stage 3 & 2) ===
    const handleSubmitAssessment = async () => {
        setIsSubmitting(true);
        try {
            let data;
            if (submissionMode === 'quiz') {
                if (quizAnswers.some(a => a === null)) {
                    setIsSubmitting(false); return;
                }
                const response = await fetch('http://127.0.0.1:8000/api/user/assessment/quiz_evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        skill_name: activeSkillName,
                        answers: quizAnswers
                    })
                });
                data = await response.json();
            } else if (submissionMode === 'upload') {
                const formData = new FormData();
                formData.append('email', user?.email || "unknown");
                formData.append('skill_name', activeSkillName);
                if (selectedFile) formData.append('file', selectedFile);
                const response = await fetch('http://127.0.0.1:8000/api/user/assessment/upload_evaluate', {
                    method: 'POST', body: formData
                });
                data = await response.json();
            } else {
                const response = await fetch('http://127.0.0.1:8000/api/user/assessment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        skill_name: activeSkillName,
                        submission: submission,
                        expected_keywords: evaluationData?.keywords || []
                    })
                });
                data = await response.json();
            }

            await fetch('http://127.0.0.1:8000/api/assessment/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.email || "unknown",
                    skillId: activeSkillName,
                    answers: submissionMode === 'quiz' ? `AI Quiz Score: ${data.score}` : (submissionMode === 'upload' ? `File: ${selectedFile?.name}` : submission),
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
        setSelectedFile(null);
        setWantsToReassess(false);
        navigate('/assessment');
    };

    const handleRemoveSkill = async (name) => {
        const newSkillsList = skills.filter(s => s.name !== name);
        setSkills(newSkillsList);
        await saveSkillsToProfile(newSkillsList.map(s => ({
            name: s.name, level: s.level, progress: s.progress, status: s.status,
            description: s.description, components: s.components, category: s.category
        })));
    };

    const SOFT_SKILLS_LIST = ["Communication", "Teamwork", "Problem Solving", "Adaptability"];
    const unevaluatedSoftSkills = SOFT_SKILLS_LIST.filter(
        ss => !skills.some(s => s.name.toLowerCase() === ss.toLowerCase())
    );
    const allSoftAnswered = unevaluatedSoftSkills.length > 0 &&
        unevaluatedSoftSkills.every(ss => softSkillAnswers[ss] !== undefined);

    if (loading) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
                </div>
            </DashboardLayout>
        );
    }

    // === RENDER LOGIC ===
    if (!activeSkillName) {
        return (
            <DashboardLayout user={user} onLogout={handleLogout}>
                <div className="skills-page-container">
                    <div className="section-header" style={{ marginBottom: '2rem', display: 'block' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Assessment Hub</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Manage your verified skills and take AI-powered assessments.</p>
                    </div>

                    <section className="dashboard-section" style={{ marginBottom: '2.5rem' }}>
                        <div className="section-header">
                            <h3>Your Managed Skills</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button variant="outline" onClick={() => navigate('/upskill-plan')} style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={18} /> My Upskill Plan
                                </Button>
                                <Button variant="primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Plus size={18} /> Add Skills
                                </Button>
                            </div>
                        </div>

                        {/* MODAL: COMBINED STAGE 2 & 3 */}
                        {isModalOpen && (
                            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                <div className="animate-fade-in" style={{ backgroundColor: 'var(--color-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {techResult || majorResult ? 'Assessment Results' : techFlowActive ? `Skill Assessment: ${activeTechSkill}` : 'Add New Skills'}
                                    </h3>
                                    
                                    {/* RESULTS VIEW */}
                                    {(techResult || majorResult) ? (
                                        <div className="animate-fade-in">
                                            {majorResult ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{majorResult.overall_score}%</div>
                                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Overall {userMajor} Level: {majorResult.level}</div>
                                                    <div style={{ background: 'var(--color-bg-paper)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'left', marginBottom: '2rem' }}>
                                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}><Sparkles size={18} color="var(--color-primary)"/> AI Feedback</h4>
                                                        <p style={{ margin: 0, lineHeight: 1.6 }}>{majorResult.feedback}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                                        <Button variant="outline" onClick={() => setMajorResult(null)}>Cancel</Button>
                                                        <Button onClick={acceptMajorAssessment}>Accept & Add Skills</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{techResult.percentage}%</div>
                                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Skill Level: {techResult.level}</div>
                                                    <div style={{ background: 'var(--color-bg-paper)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'left', marginBottom: '2rem' }}>
                                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}><Sparkles size={14}/> AI Insight</h4>
                                                        <p style={{ margin: 0 }}>{techResult.feedback}</p>
                                                    </div>
                                                    <Button onClick={() => { setTechResult(null); setTechFlowActive(false); setIsModalOpen(false); }}>Close & Return</Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : techFlowActive ? (
                                        /* STAGE 3 CASE STUDY FLOW */
                                        <div>
                                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Question {currentTechIdx + 1} of {techQuestions.length + 1}</span>
                                            </div>
                                            {currentTechIdx < techQuestions.length ? (
                                                <div>
                                                    <div style={{ background: 'var(--color-bg-paper)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                                                        {techQuestions[currentTechIdx].question_text}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {techQuestions[currentTechIdx].options.map((opt, i) => (
                                                            <label key={i} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <input type="radio" checked={techAnswers[techQuestions[currentTechIdx].question_number] === opt.option_text} onChange={() => setTechAnswers({...techAnswers, [techQuestions[currentTechIdx].question_number]: opt.option_text})} />
                                                                {opt.option_text}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h5 style={{ marginBottom: '1rem' }}>Problem Scenario: {activeTechSkill}</h5>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{getTechCaseStudyPrompt(activeTechSkill)}</p>
                                                    <textarea value={caseStudyText} onChange={(e) => setCaseStudyText(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '1rem', marginBottom: '1rem' }} placeholder="Propose your solution here..."/>
                                                    <input type="file" onChange={(e) => setCaseStudyFile(e.target.files[0])} style={{ marginBottom: '1.5rem' }}/>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                                                <Button variant="outline" onClick={() => setCurrentTechIdx(prev => Math.max(0, prev - 1))}>Back</Button>
                                                {currentTechIdx === techQuestions.length 
                                                    ? <Button onClick={submitTechnicalAssessment} disabled={techLoading || !caseStudyText.trim()}>{techLoading ? 'Evaluating...' : 'Finish'}</Button>
                                                    : <Button onClick={() => setCurrentTechIdx(prev => prev + 1)} disabled={!techAnswers[techQuestions[currentTechIdx].question_number]}>Next</Button>
                                                }
                                            </div>
                                        </div>
                                    ) : (
                                        /* TABS HUB */
                                        <>
                                            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                                                <button onClick={() => setActiveTab('technical')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'technical' ? '2px solid var(--color-primary)' : '0', cursor: 'pointer' }}>Technical</button>
                                                <button onClick={() => setActiveTab('major')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'major' ? '2px solid var(--color-primary)' : '0', cursor: 'pointer' }}>Major Assessment</button>
                                                <button onClick={() => setActiveTab('soft')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'soft' ? '2px solid var(--color-primary)' : '0', cursor: 'pointer' }}>Soft Skills</button>
                                            </div>

                                            {activeTab === 'technical' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                                    {dbSkillsList.map(skill => (
                                                        <button key={skill.skill_name} onClick={() => startTechnicalAssessment(skill.skill_name)} style={{ padding: '1rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer' }}>
                                                            {skill.skill_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'major' && (
                                                <div>
                                                    {!userMajor ? <p>Please set your major in profile.</p> : (
                                                        <div>
                                                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                                                                <h4 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{userMajor} Unified Assessment</h4>
                                                                <p style={{ margin: 0, fontSize: '0.95rem' }}>{majorAssessmentTask?.task_description || "Loading scenario..."}</p>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                                <button onClick={() => setSubmissionMode('text')} style={{ color: submissionMode === 'text' ? 'var(--color-primary)' : '#666', border: 'none', cursor: 'pointer', background: 'none' }}>Text Answer</button>
                                                                <button onClick={() => setSubmissionMode('file')} style={{ color: submissionMode === 'file' ? 'var(--color-primary)' : '#666', border: 'none', cursor: 'pointer', background: 'none' }}>File Upload</button>
                                                            </div>
                                                            {submissionMode === 'text' 
                                                                ? <textarea value={submission} onChange={(e) => setSubmission(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '1rem' }} placeholder="Write your full technical response..."/>
                                                                : <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                                            }
                                                            <div style={{ marginTop: '1.5rem' }}>
                                                                <Button onClick={handleMajorSubmit} disabled={majorSubmitting}>{majorSubmitting ? 'Evaluating Full Major...' : 'Submit Major Assessment'}</Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'soft' && (
                                                <div>
                                                    <p style={{ marginBottom: '1rem', color: '#666' }}>Evaluate your core behavioral attributes.</p>
                                                    {SOFT_SKILLS_LIST.map(skill => {
                                                        const isDone = skills.some(s => s.name === skill);
                                                        const qObj = getShortEvaluationForSkill(skill, 'Soft');
                                                        if (isDone) return null;
                                                        return (
                                                            <div key={skill} style={{ marginBottom: '2rem', border: '1px solid var(--color-border)', padding: '1rem' }}>
                                                                <h5 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{skill}</h5>
                                                                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{qObj.question}</p>
                                                                {qObj.options.map((opt, i) => (
                                                                    <label key={i} style={{ display: 'block', padding: '0.5rem', cursor: 'pointer' }}>
                                                                        <input type="radio" checked={softSkillAnswers[skill] === i} onChange={() => setSoftSkillAnswers({...softSkillAnswers, [skill]: i})} />
                                                                        <span style={{ marginLeft: '0.5rem' }}>{opt.text}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )
                                                    })}
                                                    <Button onClick={submitAllSoftSkills} disabled={!allSoftAnswered}>Submit Soft Skills</Button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                        <Button variant="outline" onClick={() => { setIsModalOpen(false); setTechFlowActive(false); }}>Close</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="jobs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                            {skills.map((skill, index) => (
                                <div key={index} className="job-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{skill.name}</h4>
                                        <button onClick={() => handleRemoveSkill(skill.name)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', background: 'var(--color-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{skill.level}</span>
                                        <span style={{ fontSize: '0.75rem', color: skill.status === 'Verified' ? '#10B981' : '#F59E0B' }}>{skill.status}</span>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                            <span>Progress</span>
                                            <span>{skill.progress}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#eee', borderRadius: '3px' }}>
                                            <div style={{ width: `${skill.progress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Button variant="outline" style={{ width: '100%' }} onClick={() => navigate(`/assessment?skill=${encodeURIComponent(skill.name)}`)}>
                                            {skill.status === 'Verified' ? 'Reassess' : 'Verify Skill'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        );
    }

    // === INDIVIDUAL SKILL EVALUATION VIEW (Stage 3 Layout) ===
    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <button onClick={() => navigate('/assessment')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <ChevronLeft size={16} /> Back to Hub
                </button>

                {!result ? (
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #eee' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{activeSkillName} Evaluation</h2>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
                            <button onClick={() => setSubmissionMode('quiz')} style={{ padding: '1rem', borderBottom: submissionMode === 'quiz' ? '2px solid blue' : '0', cursor: 'pointer' }}>AI Quiz</button>
                            <button onClick={() => setSubmissionMode('text')} style={{ padding: '1rem', borderBottom: submissionMode === 'text' ? '2px solid blue' : '0', cursor: 'pointer' }}>Scenario Answer</button>
                            <button onClick={() => setSubmissionMode('upload')} style={{ padding: '1rem', borderBottom: submissionMode === 'upload' ? '2px solid blue' : '0', cursor: 'pointer' }}>Upload Evidence</button>
                        </div>

                        {submissionMode === 'quiz' ? (
                            <div>
                                {quizLoading ? <p>Generating quiz...</p> : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {quizQuestions.map((q, i) => (
                                            <div key={i}>
                                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{i+1}. {q}</p>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    {[10, 7, 5, 2, 0].map(v => (
                                                        <label key={v} style={{ fontSize: '0.8rem' }}>
                                                            <input type="radio" checked={quizAnswers[i] === v} onChange={() => { const a = [...quizAnswers]; a[i] = v; setQuizAnswers(a); }} /> {v > 5 ? 'Agree' : v < 5 ? 'Disagree' : 'Neutral'}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : submissionMode === 'text' ? (
                            <div>
                                <p style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{evaluationData?.question}</p>
                                <textarea value={submission} onChange={(e) => setSubmission(e.target.value)} style={{ width: '100%', minHeight: '200px' }} placeholder="Detail your experience..."/>
                            </div>
                        ) : (
                            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <Button onClick={handleSubmitAssessment} disabled={isSubmitting}>{isSubmitting ? 'Evaluating...' : 'Submit Evaluation'}</Button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '1rem' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)' }}>{result.score}%</div>
                        <h3>Level: {result.level}</h3>
                        <div style={{ background: '#f0f7ff', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', textAlign: 'left' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={18}/> AI Feedback</h4>
                            <p>{result.suggestion}</p>
                        </div>
                        <Button onClick={resetEvaluation}>Finish</Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
