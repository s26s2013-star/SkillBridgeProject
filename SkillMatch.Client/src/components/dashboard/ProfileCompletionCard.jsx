import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const ProfileCompletionCard = ({ completion, recentActivity }) => {
    // SVG circle math
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completion / 100) * circumference;

    return (
        <div className="side-cards">
            {/* Profile Completion Widget */}
            <section className="dashboard-card profile-widget">
                <h3>Profile Completion</h3>
                <div className="completion-chart">
                    <div className="circular-progress">
                        <svg viewBox="0 0 100 100">
                            <circle
                                className="circle-bg"
                                cx="50"
                                cy="50"
                                r={radius}
                                strokeWidth="10"
                            />
                            <circle
                                className="circle-progress"
                                cx="50"
                                cy="50"
                                r={radius}
                                strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="completion-value">{completion}%</div>
                    </div>
                    <div className="completion-text">
                        <p>Almost there! Add 2 more skills to boost your matching rate.</p>
                        <a href="/profile" className="action-link">Complete Profile <ChevronRight size={16} /></a>
                    </div>
                </div>
            </section>

            {/* Recent Activity */}
            <section className="dashboard-card activity-widget">
                <div className="section-header">
                    <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className={`activity-indicator ${activity.type}`}></div>
                            <div className="activity-content">
                                <p>{activity.text}</p>
                                <span>{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <a href="/activity" className="view-all-link">View all activity <ArrowRight size={16} /></a>
            </section>
        </div>
    );
};
