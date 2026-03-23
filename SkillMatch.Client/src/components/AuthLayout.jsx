import React from 'react';
import logo from '../assets/logo.png';

export const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
        }}>
            {/* Left side - Form */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '2rem 10%',
            }} className="animate-fade-in">

                <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <img
                                src={logo}
                                alt="SkillsBridge Logo"
                                style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
                            />
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.025em' }}>
                                SkillsBridge
                            </h1>
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                        {title}
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                        {subtitle}
                    </p>
                </div>

                <div style={{
                    backgroundColor: 'var(--color-white)',
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(46, 111, 126, 0.05)',
                }}>
                    {children}
                </div>
            </div>

            {/* Right side - Illustration/Decorative */}
            <div style={{
                flex: '1',
                backgroundColor: 'var(--color-active)',
                display: 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
                position: 'relative',
                overflow: 'hidden'
            }} className="lg-flex">

                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    opacity: '0.05',
                    zIndex: 0
                }} />

                <div style={{ zIndex: 1, maxWidth: '560px', textAlign: 'center' }}>
                    <img
                        src="/hero.svg"
                        alt="SkillsBridge Illustration"
                        style={{ width: '100%', maxWidth: '440px', height: 'auto', margin: '0 auto 3rem auto', display: 'block' }}
                    />
                    <h3 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '1.25rem', letterSpacing: '-0.025em', lineHeight: '1.2' }}>
                        Bridge your skills to real opportunities.
                    </h3>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                        SkillsBridge helps students and graduates connect through smart skill-based matching and assessment.
                    </p>
                </div>
            </div>

            <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
        }
      `}</style>
        </div >
    );
};
