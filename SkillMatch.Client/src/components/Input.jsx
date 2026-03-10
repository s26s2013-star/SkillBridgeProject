import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({ label, type = 'text', ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {label && (
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text)' }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        paddingRight: isPassword ? '2.5rem' : '1rem',
                        backgroundColor: 'var(--color-input-bg)',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        color: 'var(--color-text)',
                        transition: 'var(--transition)',
                        outline: 'none',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 4px var(--color-active)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.boxShadow = 'none';
                    }}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0'
                        }}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};
