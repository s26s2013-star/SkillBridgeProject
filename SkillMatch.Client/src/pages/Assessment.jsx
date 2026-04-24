import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/Button';
import { 
    Code2, UploadCloud, CheckCircle2, AlertCircle, ChevronLeft, 
    FileText, Loader2, Sparkles, Lightbulb, Plus, Clock, Info, Trash2,
    Target
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
    const [multiAnswers, setMultiAnswers] = useState({ 0: '', 1: '', 2: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [submissionMode, setSubmissionMode] = useState('quiz');
    const [wantsToReassess, setWantsToReassess] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState(new Array(10).fill(null));
    const [quizLoading, setQuizLoading] = useState(false);

    // === VOICE RECORDING STATE ===
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [multiAudioBlobs, setMultiAudioBlobs] = useState({ 0: null, 1: null, 2: null });
    const [multiAudioURLs, setMultiAudioURLs] = useState({ 0: null, 1: null, 2: null });
    const [recordingIndex, setRecordingIndex] = useState(null);
    const mediaRecorderRef = React.useRef(null);
    const audioChunksRef = React.useRef([]);

    // === NEW TECHNICAL ASSESSMENT STATE ===
    const [techFlowActive, setTechFlowActive] = useState(false);
    const [techQuestions, setTechQuestions] = useState([]);
    const [currentTechIdx, setCurrentTechIdx] = useState(0);
    const [techAnswers, setTechAnswers] = useState({}); // { question_number: selected_option_text }
    const [techResult, setTechResult] = useState(null);
    const [techLoading, setTechLoading] = useState(false);
    const [activeTechSkill, setActiveTechSkill] = useState("");
    const [caseStudyText, setCaseStudyText] = useState("");
    const [caseStudyFile, setCaseStudyFile] = useState(null);

    // === NEW SOFT SKILL MULTI-SCENARIO STATE ===
    const [softMultiAnswers, setSoftMultiAnswers] = useState(["", "", ""]);
    const [softRecordings, setSoftRecordings] = useState([
        { blob: null, url: null, isRecording: false, status: 'idle' },
        { blob: null, url: null, isRecording: false, status: 'idle' },
        { blob: null, url: null, isRecording: false, status: 'idle' }
    ]);
    const [mediaRecorders, setMediaRecorders] = useState([null, null, null]);

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

                // Merge: use specializedSkills for the modal if major is set
                // Store in state
                if (pulledMajor && pulledMajor !== 'Not specified') {
                    setDbSkillsList(specializedSkills);
                    console.log(`[Assessment] Loaded ${specializedSkills.length} skills for major: ${pulledMajor}`);
                } else {
                    setDbSkillsList(allDbSkills);
                    console.log("[Assessment] No major detected, falling back to all skills");
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
                    const category = match ? match.category : 'Custom';
                    setSkillDetails({
                        ...match,
                        name: activeSkillName,
                        category: category
                    });
                    
                    if (category === 'Soft') {
                        setEvaluationData(getShortEvaluationForSkill(activeSkillName, category));
                        setSubmissionMode('text'); // Default to text for soft skills
                    } else {
                        setEvaluationData(getEvaluationForSkill(activeSkillName, category));
                        setSubmissionMode('quiz'); // Default to quiz for technical skills
                    }
                    
                    setQuizLoading(true);
                    fetch(`http://127.0.0.1:8000/api/assessment/quiz-questions?skill_name=${encodeURIComponent(activeSkillName)}&category=${encodeURIComponent(isSoftSkill ? 'Soft' : category)}`)
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

    const startShortTest = async (skillName, category) => {
        const isSoft = category === 'Soft' || ['communication', 'teamwork', 'problem solving', 'time management', 'adaptability'].includes(skillName?.toLowerCase());
        if (isSoft) {
            const skillToAdd = {
                name: skillName,
                progress: 0,
                status: 'Not tested',
                level: 'Beginner',
                category: 'Soft',
                description: 'Soft skill requires AI text or voice assessment for proficiency scoring.',
                components: []
            };
            const newSkillsList = [skillToAdd, ...skills.filter(s => s.name.toLowerCase() !== skillName.toLowerCase())];
            setSkills(newSkillsList);
            await saveSkillsToProfile(newSkillsList.map(s => ({
                name: s.name, level: s.level, progress: s.progress, status: s.status,
                description: s.description, components: s.components, category: s.category
            })));
            setShortTestResult(skillToAdd);
            return;
        }
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

    // --- NEW TECHNICAL ASSESSMENT FUNCTIONS ---
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
            
            // 2. Submit Case Study
            const formData = new FormData();
            formData.append('skill_name', activeTechSkill);
            formData.append('case_study_text', caseStudyText);
            if (caseStudyFile) {
                formData.append('file', caseStudyFile);
            }

            const caseStudyRes = await fetch('http://127.0.0.1:8000/api/technical-assessment/case-study', {
                method: 'POST',
                body: formData
            });
            const caseStudyData = await caseStudyRes.json();

            // 3. Calculate Final Score: (Rubric % + Case Study %) / 2
            const rubricPercentage = rubricData.percentage || 0;
            const caseStudyPercentage = caseStudyData.case_study_percentage || 0;
            const finalPercentage = (rubricPercentage + caseStudyPercentage) / 2;

            // Determine final level based on the final percentage
            let finalLevel = "Beginner";
            if (finalPercentage >= 85) finalLevel = "Advanced";
            else if (finalPercentage >= 60) finalLevel = "Intermediate";

            const finalResult = {
                ...rubricData,
                rubric_percentage: rubricPercentage || 0,
                case_study_percentage: caseStudyPercentage || 0,
                percentage: round(finalPercentage, 2) || 0,
                level: finalLevel || "Beginner",
                feedback: caseStudyData.feedback || "No feedback provided.",
                problem_identification: caseStudyData.problem_identification || 0,
                solution_appropriateness: caseStudyData.solution_appropriateness || 0,
                technical_depth: caseStudyData.technical_depth || 0,
                practical_application: caseStudyData.practical_application || 0,
                clarity_and_evidence: caseStudyData.clarity_and_evidence || 0
            };

            setTechResult(finalResult);

            // 4. Save to Profile
            let newSkillsList = [...skills];
            const skillToAdd = {
                name: activeTechSkill,
                progress: round(finalPercentage, 2),
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

            // Save result record
            try {
                await fetch('http://127.0.0.1:8000/api/assessment/result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.id || user?.email || "unknown",
                        skillId: activeTechSkill,
                        skillName: activeTechSkill,
                        category: 'Technical',
                        answers: `Final Score: ${round(finalPercentage, 2)}%`,
                        aiScore: round(finalPercentage, 2),
                        level: finalLevel,
                        status: "completed",
                        completedAt: new Date().toISOString()
                    })
                });
            } catch (e) {
                console.error("Failed to save result record:", e);
            }

        } catch (error) {
            console.error("Error submitting technical assessment:", error);
        } finally {
            setTechLoading(false);
        }
    };

    const round = (num, decimals) => {
        return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
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

    const SOFT_SKILLS = ["Communication", "Teamwork", "Problem Solving", "Time Management", "Adaptability"];
    const unevaluatedSoftSkills = SOFT_SKILLS.filter(
        ss => !skills.some(s => s.name.toLowerCase() === ss.toLowerCase())
    );
    const allSoftAnswered = unevaluatedSoftSkills.length > 0 &&
        unevaluatedSoftSkills.every(ss => softSkillAnswers[ss] !== undefined);

    // --- VOICE RECORDING LOGIC ---
    const startRecording = async (index) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setSoftRecordings(prev => {
                    const next = [...prev];
                    next[index] = { ...next[index], blob, url, isRecording: false, status: 'recorded' };
                    return next;
                });
            };

            recorder.start();
            setMediaRecorders(prev => {
                const next = [...prev];
                next[index] = recorder;
                return next;
            });
            setSoftRecordings(prev => {
                const next = [...prev];
                next[index] = { ...next[index], isRecording: true, status: 'recording' };
                return next;
            });
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required for voice assessment.");
        }
    };

    const stopRecording = (index) => {
        const recorder = mediaRecorders[index];
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            recorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const deleteRecording = (index) => {
        setSoftRecordings(prev => {
            const next = [...prev];
            next[index] = { blob: null, url: null, isRecording: false, status: 'idle' };
            return next;
        });
    };

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

    const startRecording = async (index = null) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            setRecordingIndex(index);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (index !== null) {
                    setMultiAudioBlobs(prev => ({ ...prev, [index]: blob }));
                    setMultiAudioURLs(prev => ({ ...prev, [index]: URL.createObjectURL(blob) }));
                } else {
                    setAudioBlob(blob);
                    setAudioURL(URL.createObjectURL(blob));
                }
                stream.getTracks().forEach(track => track.stop());
                setRecordingIndex(null);
            };
            mediaRecorder.start();
            setIsRecording(true);
            if (index !== null) {
                setMultiAudioBlobs(prev => ({ ...prev, [index]: null }));
                setMultiAudioURLs(prev => ({ ...prev, [index]: null }));
            } else {
                setAudioBlob(null);
                setAudioURL(null);
            }
        } catch (err) {
            console.error('Microphone access denied or error:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmitAssessment = async () => {
        setIsSubmitting(true);
        try {
            let data;
            
            if (skillDetails?.category === 'Soft') {
                if (submissionMode === 'voice') {
                    // Multi-Voice Submission
                    const formData = new FormData();
                    formData.append('email', user.email);
                    formData.append('skill_name', activeSkillName);
                    
                    const keywords = skillDetails.scenarios.map(s => s.keywords);
                    formData.append('expected_keywords_json', JSON.stringify(keywords));
                    
                    softRecordings.forEach((rec, i) => {
                        if (rec.blob) {
                            formData.append('files', rec.blob, `scenario_${i+1}.webm`);
                        }
                    });

                    const response = await fetch('http://127.0.0.1:8000/api/user/assessment/voice_evaluate_multi', {
                        method: 'POST',
                        body: formData
                    });
                    data = await response.json();
                } else {
                    // Multi-Text Submission
                    const response = await fetch('http://127.0.0.1:8000/api/user/assessment/text_evaluate_multi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            skill_name: activeSkillName,
                            answers: softMultiAnswers,
                            expected_keywords: skillDetails.scenarios.map(s => s.keywords)
                        })
                    });
                    data = await response.json();
                }
            } else if (submissionMode === 'quiz') {
                if (quizAnswers.some(a => a === null)) {
                    setIsSubmitting(false);
                    return;
                }
                const response = await fetch('http://127.0.0.1:8000/api/user/assessment/quiz_evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, skill_name: activeSkillName, answers: quizAnswers })
                });
                data = await response.json();
            } else if (submissionMode === 'upload') {
                if (!selectedFile || !activeSkillName) {
                    setIsSubmitting(false);
                    return;
                }
                const formData = new FormData();
                formData.append('email', user?.email || 'unknown');
                formData.append('skill_name', activeSkillName);
                formData.append('file', selectedFile);
                const response = await fetch('http://127.0.0.1:8000/api/user/assessment/upload_evaluate', {
                    method: 'POST', body: formData
                });
                data = await response.json();
            } else {
                if (isSoft) {
                    const hasAnswers = Object.values(multiAnswers).some(ans => ans.trim());
                    if (!hasAnswers || !activeSkillName) {
                        setIsSubmitting(false);
                        return;
                    }
                    const formData = new FormData();
                    formData.append('email', user?.email || 'unknown');
                    formData.append('skill_name', activeSkillName);
                    const allQs = evaluationData.allScenarios.map((s, i) => `[SCENARIO ${i + 1}] ${s.question}`).join('\n');
                    const allAns = evaluationData.allScenarios.map((s, i) => `[ANSWER ${i + 1}] ${multiAnswers[i] || ''}`).join('\n\n');
                    const allKeywords = evaluationData.allScenarios.flatMap(s => s.keywords || []).join(', ');
                    formData.append('question', allQs);
                    formData.append('expected_keywords', allKeywords);
                    formData.append('submission_text', allAns);
                    const response = await fetch('http://127.0.0.1:8000/api/user/assessment/text_evaluate', {
                        method: 'POST', body: formData
                    });
                    data = await response.json();
                } else {
                    if (!submission.trim() || !activeSkillName) {
                        setIsSubmitting(false);
                        return;
                    }
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
                    data = await response.json();
                }
            }
            await fetch('http://127.0.0.1:8000/api/assessment/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id || user?.email || 'unknown',
                    skillId: activeSkillName,
                    answers: submissionMode === 'quiz'
                        ? `AI Quiz Score: ${data.score}`
                        : (submissionMode === 'upload'
                            ? `File: ${selectedFile?.name}`
                            : submissionMode === 'voice'
                                ? 'Voice Recording'
                                : (skillDetails?.isSoft ? Object.values(multiAnswers).join(' | ') : submission)),
                    aiScore: data.score || 0,
                    status: 'completed',
                    completedAt: new Date().toISOString()
                })
            });
            setResult(data);
        } catch (err) {
            console.error('Submission failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetEvaluation = () => {
        setResult(null);
        setSubmission('');
        setSelectedFile(null);
        setSoftMultiAnswers(["", "", ""]);
        setSoftRecordings([
            { blob: null, url: null, isRecording: false, status: 'idle' },
            { blob: null, url: null, isRecording: false, status: 'idle' },
            { blob: null, url: null, isRecording: false, status: 'idle' }
        ]);
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
                                        {techResult ? 'Assessment Results' : techFlowActive ? `Skill Assessment: ${activeTechSkill}` : shortTestResult ? 'Assessment Complete' : activeShortTest ? `AI Assessment: ${activeShortTest.name}` : 'Add New Skills'}
                                    </h3>
                                    
                                    {techResult ? (
                                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                            <div style={{ 
                                                width: '100%', maxWidth: '400px', margin: '0 auto', background: 'var(--color-bg-paper)', 
                                                padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}>
                                                <div style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                                    {activeTechSkill}
                                                </div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Your Score</div>
                                                <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.5rem', lineHeight: 1 }}>
                                                    {techResult.total_score}<span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>/9</span>
                                                </div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '1.5rem' }}>
                                                    Combined: {techResult.percentage}%
                                                </div>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                                                    <div style={{ background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Rubric</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text)' }}>{techResult.rubric_percentage || 0}%</div>
                                                    </div>
                                                    <div style={{ background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Case Study</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text)' }}>{techResult.case_study_percentage || 0}%</div>
                                                    </div>
                                                </div>

                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', 
                                                    background: 'var(--color-white)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
                                                    fontWeight: '700', color: 'var(--color-text)', marginBottom: '1rem'
                                                }}>
                                                    Assessed Level: {techResult.level || "Beginner"}
                                                </div>

                                                {techResult.feedback && (
                                                    <div style={{ textAlign: 'left', marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <Sparkles size={14} /> AI Feedback
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                                                            {techResult.feedback}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                                                <Button onClick={() => {
                                                    setTechResult(null);
                                                    setTechFlowActive(false);
                                                    setIsModalOpen(false);
                                                }} style={{ padding: '0.75rem 2.5rem' }}>
                                                    Close & Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : techFlowActive ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {techLoading ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
                                                    <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                                                            {currentTechIdx < techQuestions.length 
                                                                ? `Rubric Question ${currentTechIdx + 1} of ${techQuestions.length}`
                                                                : `Final Step: Case Study Evaluation`}
                                                        </span>
                                                        <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', width: '100px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', background: 'var(--color-primary)', width: `${((currentTechIdx + 1) / (techQuestions.length + 1)) * 100}%`, transition: 'width 0.3s ease' }}></div>
                                                        </div>
                                                    </div>

                                                    {currentTechIdx < techQuestions.length ? (
                                                        <>
                                                            <div style={{ background: 'var(--color-bg-paper)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                                                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', lineHeight: 1.6 }}>
                                                                    {techQuestions[currentTechIdx]?.question_text}
                                                                </p>
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                {techQuestions[currentTechIdx]?.options.map((option, idx) => (
                                                                    <label 
                                                                        key={idx} 
                                                                        style={{ 
                                                                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', 
                                                                            borderRadius: 'var(--radius-sm)', border: techAnswers[techQuestions[currentTechIdx].question_number] === option.option_text ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', 
                                                                            background: techAnswers[techQuestions[currentTechIdx].question_number] === option.option_text ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-white)', cursor: 'pointer', transition: 'all 0.2s' 
                                                                        }}
                                                                    >
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`tech_option_${currentTechIdx}`}
                                                                            checked={techAnswers[techQuestions[currentTechIdx].question_number] === option.option_text}
                                                                            onChange={() => setTechAnswers(prev => ({...prev, [techQuestions[currentTechIdx].question_number]: option.option_text}))}
                                                                            style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-primary)' }}
                                                                        />
                                                                        <span style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{option.option_text}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
                                                                <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>Problem Scenario Answer</h5>
                                                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                                                                    <strong>{activeTechSkill}: </strong> {getTechCaseStudyPrompt(activeTechSkill)}
                                                                    <br /><br />
                                                                    You may optionally upload supporting diagrams or code.
                                                                </p>
                                                            </div>

                                                            <textarea
                                                                placeholder="Describe your technical approach and reasoning here..."
                                                                value={caseStudyText}
                                                                onChange={(e) => setCaseStudyText(e.target.value)}
                                                                style={{ 
                                                                    width: '100%', minHeight: '180px', padding: '1rem', borderRadius: 'var(--radius-md)', 
                                                                    border: '1px solid var(--color-border)', fontSize: '1rem', lineHeight: 1.6,
                                                                    resize: 'vertical'
                                                                }}
                                                            />

                                                            <div style={{ border: '1px dashed var(--color-border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--color-white)' }}>
                                                                <input 
                                                                    type="file" 
                                                                    id="caseStudyUpload" 
                                                                    style={{ display: 'none' }} 
                                                                    onChange={(e) => setCaseStudyFile(e.target.files[0])}
                                                                />
                                                                <label htmlFor="caseStudyUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <UploadCloud size={32} color="var(--color-text-muted)" />
                                                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                                                        {caseStudyFile ? caseStudyFile.name : 'Upload supporting evidence (Optional)'}
                                                                    </span>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PDF, Image, or Text file</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => setCurrentTechIdx(prev => Math.max(0, prev - 1))}
                                                            disabled={currentTechIdx === 0}
                                                        >
                                                            Previous
                                                        </Button>
                                                        
                                                        {currentTechIdx === techQuestions.length ? (
                                                            <Button 
                                                                onClick={submitTechnicalAssessment}
                                                                disabled={!caseStudyText.trim() || techLoading}
                                                            >
                                                                {techLoading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Full Assessment'}
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => setCurrentTechIdx(prev => prev + 1)}
                                                                disabled={!techAnswers[techQuestions[currentTechIdx].question_number]}
                                                            >
                                                                Next
                                                            </Button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : shortTestResult ? (
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
                                                                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Select a technical skill to begin the assessment flow.</p>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                                                                        {dbSkillsList.filter(s => s.category !== 'Soft').map(skill => {
                                                                            const skillName = skill.skill_name || skill.name;
                                                                            const isAlreadyOwned = skills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
                                                                            return (
                                                                                <button 
                                                                                    key={skillName} 
                                                                                    onClick={() => startTechnicalAssessment(skillName)}
                                                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '1rem', background: 'var(--color-white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border 0.2s' }}
                                                                                >
                                                                                    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--color-text)' }}>{skillName}</span>
                                                                                    <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--color-primary)' }} />
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {activeTab === 'soft' && (
                                                    <div>
                                                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                                            Select a core soft skill to begin your multi-scenario research-based evaluation.
                                                        </p>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                                                            {SOFT_SKILLS.map(softSkill => {
                                                                const isAlreadyOwned = skills.some(s => s.name.toLowerCase() === softSkill.toLowerCase());
                                                                return (
                                                                    <button 
                                                                        key={softSkill} 
                                                                        onClick={() => {
                                                                            setIsModalOpen(false);
                                                                            navigate(`/assessment?skill=${encodeURIComponent(softSkill)}`);
                                                                        }}
                                                                        style={{ 
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                                            gap: '0.75rem', padding: '1.25rem', 
                                                                            background: isAlreadyOwned ? 'rgba(0,0,0,0.03)' : 'var(--color-white)', 
                                                                            borderRadius: 'var(--radius-md)', 
                                                                            border: '1px solid var(--color-border)', 
                                                                            cursor: 'pointer', textAlign: 'left', 
                                                                            width: '100%', transition: 'all 0.2s',
                                                                            boxShadow: isAlreadyOwned ? 'none' : '0 2px 4px rgba(0,0,0,0.04)'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                            {isAlreadyOwned ? <CheckCircle2 size={18} color="var(--color-success)" /> : <Target size={18} color="var(--color-primary)" />}
                                                                            <span style={{ fontSize: '1rem', fontWeight: '600', color: isAlreadyOwned ? 'var(--color-text-muted)' : 'var(--color-text)' }}>{softSkill}</span>
                                                                        </div>
                                                                        {!isAlreadyOwned && <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--color-primary)' }} />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                                                        </div>
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

                                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {skill.status === 'Verified' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.875rem', fontWeight: '600', width: '100%', justifyContent: 'center', padding: '0.5rem', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-md)' }}>
                                                    <CheckCircle2 size={16} /> Strongly Verified
                                                </div>
                                            )}
                                            {skill.status === 'Not tested' ? (
                                                <Button 
                                                    variant="outline" 
                                                    className="btn-full" 
                                                    style={{ fontSize: '0.8125rem' }}
                                                    onClick={() => navigate(`/assessment?skill=${encodeURIComponent(skill.name)}`)}
                                                >
                                                    {skill.category === 'Soft' ? 'Reassess' : 'Complete Assessment'}
                                                </Button>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                    <Button 
                                                        variant="outline" 
                                                        style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem' }}
                                                        onClick={() => navigate(`/assessment?skill=${encodeURIComponent(skill.name)}`)}
                                                    >
                                                        Reassess
                                                    </Button>
                                                    {skill.category !== 'Soft' && (
                                                        <Button 
                                                            variant="outline" 
                                                            style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                                                            onClick={() => {}}
                                                            disabled
                                                        >
                                                            Show Matching
                                                        </Button>
                                                    )}
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

                {(() => {
                    const activeSkillData = skills.find(s => s.name.toLowerCase() === activeSkillName.toLowerCase());
                    const isCompleted = activeSkillData && activeSkillData.status !== 'Not tested';
                    const showAssessmentForm = !isCompleted || wantsToReassess;

                    if (!showAssessmentForm) {
                        return (
                            <div className="animate-fade-in" style={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--color-primary)' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Assessment Completed</h2>
                                <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto 2.5rem auto', fontSize: '1.1rem' }}>
                                    You have already completed the evaluation for {activeSkillName} with a score of {activeSkillData.progress}%.
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'flex-start' }}>
                                    <Button variant="outline" onClick={() => setWantsToReassess(true)} style={{ padding: '0.75rem 2rem' }}>Reassess</Button>
                                    {!skillDetails?.isSoft && activeSkillData.category !== 'Soft' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                            <Button className="btn-primary" disabled style={{ padding: '0.75rem 2rem', opacity: 0.6, cursor: 'not-allowed' }}>Show Matching</Button>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Coming soon</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return !result ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Task Area */}
                        <div style={{ 
                            background: 'var(--color-bg-paper)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-xl)',
                            padding: '2rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                                <button
                                    onClick={() => setSubmissionMode('text')}
                                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: submissionMode === 'text' ? '2px solid var(--color-primary)' : '2px solid transparent', color: submissionMode === 'text' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                    Write Answer
                                </button>
                                <button
                                    onClick={() => setSubmissionMode('voice')}
                                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: submissionMode === 'voice' ? '2px solid var(--color-primary)' : '2px solid transparent', color: submissionMode === 'voice' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                    Voice Recording
                                </button>
                                {skillDetails.category !== 'Soft' && (
                                    <>
                                    <button
                                        onClick={() => setSubmissionMode('quiz')}
                                        style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: submissionMode === 'quiz' ? '2px solid var(--color-primary)' : '2px solid transparent', color: submissionMode === 'quiz' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                                    >
                                        AI Quiz
                                    </button>
                                    <button
                                        onClick={() => setSubmissionMode('upload')}
                                        style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: submissionMode === 'upload' ? '2px solid var(--color-primary)' : '2px solid transparent', color: submissionMode === 'upload' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                                    >
                                        Upload Work Sample
                                    </button>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', 
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    {submissionMode === 'voice' ? <Plus size={24} /> : (submissionMode === 'text' ? <FileText size={24} /> : <CheckCircle2 size={24} />)}
                                </div>
                                <h3 style={{ margin: 0 }}>
                                    {submissionMode === 'voice' ? 'Split Voice Assessment' : (submissionMode === 'text' ? 'Multi-Scenario Assessment' : 'AI Evaluation')}
                                </h3>
                            </div>

                            {skillDetails.category === 'Soft' && evaluationData?.scenarios ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {evaluationData.scenarios.map((scenario, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>Scenario {idx + 1}</h4>
                                            </div>
                                            <p style={{ margin: '0 0 1.25rem 0', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.5 }}>{scenario.question}</p>
                                            
                                            {submissionMode === 'text' ? (
                                                <textarea 
                                                    className="form-control"
                                                    placeholder="Describe your reasoning and exact response..."
                                                    style={{ minHeight: '120px', width: '100%', padding: '1rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                                                    value={softMultiAnswers[idx]}
                                                    onChange={(e) => {
                                                        const next = [...softMultiAnswers];
                                                        next[idx] = e.target.value;
                                                        setSoftMultiAnswers(next);
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ background: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                    {softRecordings[idx].status === 'idle' && (
                                                        <Button 
                                                            variant="primary" 
                                                            onClick={() => startRecording(idx)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem' }}
                                                        >
                                                            <Plus size={18} /> Record Answer
                                                        </Button>
                                                    )}
                                                    {softRecordings[idx].status === 'recording' && (
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => stopRecording(idx)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', borderColor: '#EF4444', color: '#EF4444' }}
                                                        >
                                                            <div className="pulse-red" style={{ width: '10px', height: '10px', background: '#EF4444', borderRadius: '50%' }} /> Stop
                                                        </Button>
                                                    )}
                                                    {softRecordings[idx].status === 'recorded' && (
                                                        <>
                                                            <audio src={softRecordings[idx].url} controls style={{ height: '32px' }} />
                                                            <button 
                                                                onClick={() => deleteRecording(idx)}
                                                                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                        {softRecordings[idx].status === 'recording' ? 'Speaking...' : (softRecordings[idx].status === 'recorded' ? 'Captured' : 'Ready')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <>
                            {submissionMode !== 'quiz' && (
                                <div style={{ marginBottom: '2rem' }}>
                                    {evaluationData.researchImportance && (
                                        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-primary)' }}>Why this matters</div>
                                            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{evaluationData.researchImportance}</div>
                                        </div>
                                    )}
                                    {skillDetails?.isSoft && evaluationData?.allScenarios ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {evaluationData.allScenarios.map((scenario, idx) => (
                                                <div key={idx} style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
                                                    <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Scenario {idx + 1}</div>
                                                    <p style={{ margin: 0, lineHeight: 1.6, fontWeight: 500, fontSize: '1.05rem', color: 'var(--color-text)' }}>{scenario.question}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
                                            <p style={{ margin: 0, lineHeight: 1.6, fontWeight: 500, fontSize: '1.05rem', color: 'var(--color-text)' }}>{evaluationData.question}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {submissionMode === 'quiz' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {quizLoading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
                                            <Loader2 className="animate-spin" size={32} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                                            <div style={{ color: 'var(--color-text-muted)' }}>Generating structured statements via AI...</div>
                                        </div>
                                    ) : (
                                        quizQuestions.map((q, qIndex) => (
                                            <div key={qIndex} style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
                                                <p style={{ margin: '0 0 1rem 0', fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                                                    {qIndex + 1}. {q}
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                                    {[
                                                        { label: 'Strongly Agree', value: 10 },
                                                        { label: 'Agree', value: 8 },
                                                        { label: 'Neutral', value: 5 },
                                                        { label: 'Disagree', value: 2 },
                                                        { label: 'Strongly Disagree', value: 0 }
                                                    ].map((opt, oIndex) => (
                                                        <label key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                                            <input 
                                                                type="radio" 
                                                                name={`question-${qIndex}`} 
                                                                value={opt.value}
                                                                checked={quizAnswers[qIndex] === opt.value}
                                                                onChange={() => {
                                                                    const newAns = [...quizAnswers];
                                                                    newAns[qIndex] = opt.value;
                                                                    setQuizAnswers(newAns);
                                                                }}
                                                            />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : submissionMode === 'text' ? (
                                skillDetails?.isSoft && evaluationData?.allScenarios ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {evaluationData.allScenarios.map((_, idx) => (
                                            <div key={idx} style={{ position: 'relative' }}>
                                                <textarea 
                                                    className="form-control"
                                                    placeholder={`Write your detailed scenario-based roleplay answer for Scenario ${idx + 1} here. Be descriptive...`}
                                                    style={{ 
                                                        minHeight: '200px', width: '100%', padding: '1.25rem', fontFamily: 'system-ui, sans-serif', 
                                                        fontSize: '1rem', lineHeight: 1.6, borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-border)', resize: 'vertical'
                                                    }}
                                                    value={multiAnswers[idx] || ''}
                                                    onChange={(e) => setMultiAnswers(prev => ({...prev, [idx]: e.target.value}))}
                                                />
                                                <div style={{ 
                                                    position: 'absolute', bottom: '1rem', right: '1.5rem', 
                                                    color: 'var(--color-text-muted)', fontSize: '0.85rem'
                                                }}>
                                                    {(multiAnswers[idx] || '').length} characters
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
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
                                )
                            ) : submissionMode === 'voice' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {skillDetails?.isSoft && evaluationData?.allScenarios ? (
                                        evaluationData.allScenarios.map((_, idx) => (
                                            <div key={idx} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Record Scenario {idx + 1}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <Button 
                                                        variant={isRecording && recordingIndex === idx ? "danger" : "outline"}
                                                        onClick={() => isRecording && recordingIndex === idx ? stopRecording() : startRecording(idx)}
                                                        disabled={isRecording && recordingIndex !== null && recordingIndex !== idx}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '200px' }}
                                                    >
                                                        {isRecording && recordingIndex === idx ? <><Square size={16} /> Stop Record</> : <><Mic size={16} /> Record Voice</>}
                                                    </Button>
                                                    
                                                    {multiAudioURLs[idx] && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                            <audio src={multiAudioURLs[idx]} controls style={{ height: '36px', flex: 1 }} />
                                                            <button onClick={() => setMultiAudioURLs(prev => ({...prev, [idx]: null}))} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.5rem' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Record Audio Answer</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Button 
                                                    variant={isRecording && recordingIndex === null ? "danger" : "outline"}
                                                    onClick={() => isRecording && recordingIndex === null ? stopRecording() : startRecording()}
                                                    disabled={isRecording && recordingIndex !== null}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '200px' }}
                                                >
                                                    {isRecording && recordingIndex === null ? <><Square size={16} /> Stop Record</> : <><Mic size={16} /> Record Voice</>}
                                                </Button>
                                                
                                                {audioURL && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                        <audio src={audioURL} controls style={{ height: '36px', flex: 1 }} />
                                                        <button onClick={() => setAudioURL(null)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.5rem' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ marginTop: '1rem', padding: '2rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-border)', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'var(--color-white)', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                            <UploadCloud size={32} color="var(--color-primary)" />
                                        </div>
                                        <h4 style={{ margin: 0 }}>Choose a file to upload</h4>
                                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>
                                            Supported: PDF, JS, PY, TSX, HTML, CSS, CPP (Max 5MB)
                                        </p>
                                        
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            style={{ display: 'none' }} 
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                                            }}
                                            accept=".pdf,.js,.py,.jsx,.ts,.tsx,.java,.cpp,.cs,.html,.css"
                                        />
                                        <label htmlFor="file-upload" style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.75rem 1.75rem', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text)', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                               onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-paper)'}
                                               onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-white)'}>
                                            Browse Files
                                        </label>
                                    </div>
                                    
                                    {selectedFile && (
                                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FileText size={20} color="var(--color-primary)" />
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{selectedFile.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedFile(null)} style={{ background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer', color: 'var(--color-error)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            </>
                            )}

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {submissionMode === 'quiz' && !quizLoading ? (
                                    <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                        {quizAnswers.filter(a => a !== null).length} / {quizQuestions.length} answered
                                    </div>
                                ) : (skillDetails.category === 'Soft' && submissionMode === 'voice') ? (
                                    <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                        {softRecordings.filter(r => r.blob).length} / 3 recorded
                                    </div>
                                ) : <div />}
                                
                                <Button 
                                    className="btn-primary" 
                                    style={{ padding: '0.75rem 2.5rem' }} 
                                    onClick={handleSubmitAssessment} 
                                    disabled={
                                        (submissionMode === 'quiz' && (quizLoading || quizAnswers.some(a => a === null))) || 
                                        (submissionMode === 'text' && (skillDetails.category === 'Soft' ? softMultiAnswers.some(a => !a.trim()) : !submission.trim())) || 
                                        (submissionMode === 'voice' && softRecordings.some(r => !r.blob)) ||
                                        (submissionMode === 'upload' && !selectedFile) || 
                                        isSubmitting
                                    }
                                >
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
                    );
                })()}
            </div>
        </DashboardLayout>
    );
};
