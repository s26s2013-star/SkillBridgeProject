import React from 'react';

export const Button = ({ children, type = 'button', className = '', ...props }) => {
    return (
        <button
            type={type}
            className={`btn ${className}`}
            {...props}
            style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
                transform: 'translateY(0)',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
        >
            {children}
        </button>
    );
};
