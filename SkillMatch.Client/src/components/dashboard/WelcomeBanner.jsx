import React from 'react';
import { Button } from '../Button';

export const WelcomeBanner = ({ userName }) => {
    return (
        <section className="welcome-banner">
            <div className="welcome-content">
                <h2>Welcome back, {userName}!</h2>
                <p>Track your skills, complete assessments, and discover jobs that match your abilities.</p>
                <div className="welcome-actions">
                    <Button>Start Assessment</Button>
                    <Button variant="outline" className="btn-explore">Explore Jobs</Button>
                </div>
            </div>
            <div className="welcome-illustration">
                {/* Placeholder for an illustration */}
                <div className="illustration-circle"></div>
            </div>
        </section>
    );
};
