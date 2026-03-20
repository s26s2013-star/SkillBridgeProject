import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login(normalizedEmail, normalizedPassword);

      if (data?.token && data?.user) {
        navigate('/dashboard');
      } else {
        setError('Login failed. Invalid server response.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.5rem',
            marginTop: '-0.5rem',
          }}
        >
          <a href="#" style={{ fontSize: '0.875rem', fontWeight: '500' }}>
            Forgot password?
          </a>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <div
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.5rem',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link to="/register" style={{ fontWeight: '600' }}>
          Create one now
        </Link>
      </div>
    </>
  );
};