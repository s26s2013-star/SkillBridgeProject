import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';

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

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/specializations');
                if (res.ok) {
                    const data = await res.json();
                    setSpecializations(data);
                }
            } catch (err) {
                console.error("Failed to load specializations", err);
            }
        };
        fetchSpecializations();
    }, []);

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
            await authService.register(name, email, password, role, major);
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
