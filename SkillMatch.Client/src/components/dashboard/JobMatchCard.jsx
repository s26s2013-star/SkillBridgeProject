import React from 'react';
import { MapPin, Building, CheckCircle2 } from 'lucide-react';
import { Button } from '../Button';

export const JobMatchCard = ({ jobs, hasSkills = true }) => {
    return (
        <section className="dashboard-section jobs-section">
            <div className="section-header">
                <h3>Recommended Jobs for You</h3>
                <a href="/jobs" className="view-all">View all</a>
            </div>
            <div className="jobs-grid">
                {!hasSkills ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                        <p>Add your skills to see matching jobs.</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                        <p>No jobs found matching your skills.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="job-card">
                            <div className="job-header">
                                <div className="job-title-wrapper">
                                    <h4>{job.title}</h4>
                                    <div className="match-badge">
                                        {job.matchScore}% Match
                                    </div>
                                </div>
                                <div className="job-meta">
                                    <span><Building size={14} /> {job.company}</span>
                                    <span><MapPin size={14} /> {job.location}</span>
                                </div>
                            </div>

                            <div className="job-skills">
                                <p>Skills required:</p>
                                <div className="skills-tags">
                                    {job.skills.map((skill, index) => (
                                        <span key={index} className="skill-tag">
                                            <CheckCircle2 size={12} className="check-icon" />
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="job-footer">
                                <Button variant="outline" className="btn-full">View Details</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};
