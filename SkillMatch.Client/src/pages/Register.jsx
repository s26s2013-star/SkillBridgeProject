import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { endpoints } from '../config/api';

export const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [major, setMajor] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [isExtracting, setIsExtracting] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/skills');
                if (res.ok) {
                    const data = await res.json();
                    setAllSkills(data);
                }
            } catch (err) {
                console.error("Failed to load skills", err);
            }
        };

        const fetchSpecializations = async () => {
            try {
                const res = await fetch(endpoints.specializations);
                if (res.ok) {
                    const data = await res.json();
                    setSpecializations(data);
                }
            } catch (err) {
                console.error("Failed to load specializations", err);
            }
        };

        fetchSpecializations();
        fetchSkills();
    }, []);

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsExtracting(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/user/extract-skills', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Failed to extract skills from CV");

            const data = await response.json();
            if (data.skills && data.skills.length > 0) {
                setSelectedSkills(prev => {
                    const currentNames = new Set(prev.map(s => typeof s === 'string' ? s : s.name));
                    const newOnes = data.skills.filter(s => !currentNames.has(s.name));
                    return [...prev, ...newOnes];
                });
            } else {
                setError("No skills matched from your CV. You can still add them manually below.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsExtracting(false);
            e.target.value = null;
        }
    };

    const toggleSkill = (skill) => {
        const skillName = typeof skill === 'string' ? skill : skill.skill_name;
        setSelectedSkills(prev => {
            const exists = prev.some(s => (typeof s === 'string' ? s : s.name) === skillName);
            if (exists) {
                return prev.filter(s => (typeof s === 'string' ? s : s.name) !== skillName);
            } else {
                return [...prev, { name: skillName, level: 'Beginner', progress: 30, status: 'Not tested' }];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authService.register(name, email, password, role, major, selectedSkills);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                        {success}
                    </div>
                )}

                <Input
                    label="Full name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                />

                <Input
                    label="Email address"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                        Major / Field of Study
                    </label>
                    <select
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        disabled={loading || specializations.length === 0}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="" disabled>Select your specialization</option>
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>

                {/* CV Scan and Skill selection block */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h5 style={{ fontWeight: '600', fontSize: '0.925rem', marginBottom: '0.25rem' }}>Initial Skills (Optional)</h5>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Scan your CV or select manually below</p>
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="file" 
                                id="cv-upload-reg" 
                                accept=".pdf,.docx,.txt" 
                                style={{ display: 'none' }} 
                                onChange={handleCVUpload}
                                disabled={isExtracting || loading}
                            />
                            <label 
                                htmlFor="cv-upload-reg" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    padding: '0.4rem 0.8rem', 
                                    background: 'var(--color-primary-light)', 
                                    color: 'var(--color-primary)', 
                                    borderRadius: 'var(--radius-md)', 
                                    cursor: (isExtracting || loading) ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s',
                                    opacity: (isExtracting || loading) ? 0.7 : 1
                                }}
                            >
                                <UploadCloud size={16} />
                                {isExtracting ? 'Scanning...' : 'Scan CV'}
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                        {allSkills.length > 0 ? allSkills.map(skill => {
                            const isSelected = selectedSkills.some(s => (typeof s === 'string' ? s : s.name) === skill.skill_name);
                            return (
                                <button
                                    key={skill.skill_name}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                        background: isSelected ? 'var(--color-primary)' : 'transparent',
                                        color: isSelected ? 'white' : 'var(--color-text)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {skill.skill_name}
                                    {isSelected && <CheckCircle2 size={10} />}
                                </button>
                            );
                        }) : (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', width: '100%', padding: '1rem' }}>
                                Loading available skills...
                            </p>
                        )}
                    </div>
                </div>

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />

                <Input
                    label="Confirm password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                />

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                        I am a...
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {['student', 'graduate'].map((r) => (
                            <label
                                key={r}
                                style={{
                                    flex: '1',
                                    border: `2px solid ${role === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    backgroundColor: role === r ? 'var(--color-active)' : 'transparent',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: role === r ? 'var(--color-primary)' : 'var(--color-text)',
                                    transition: 'var(--transition)',
                                    opacity: loading ? 0.6 : 1,
                                    pointerEvents: loading ? 'none' : 'auto'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={r}
                                    checked={role === r}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>

                <Button type="submit" style={{ marginTop: '0.5rem' }} disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                </Button>
            </form>

            <div style={{
                marginTop: '2rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1.5rem'
            }}>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: '600' }}>
                    Log in
                </Link>
            </div>
        </>
    );
};

export default Register;