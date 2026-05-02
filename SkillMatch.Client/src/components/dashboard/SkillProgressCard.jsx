import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Button } from '../Button';

export const SkillProgressCard = ({ skills }) => {
    return (
        <section className="dashboard-section skills-progress">
            <div className="section-header">
                <h3>Your Skill Progress</h3>
                <a href="/skills" className="view-all">Manage Skills</a>
            </div>

            <div className="skills-list">
                {skills.map((skill, index) => (
                    <div key={index} className="skill-item">
                        <div className="skill-info">
                            <span className="skill-name">{skill.name}</span>
                            <span className="skill-percentage">{skill.progress}%</span>
                        </div>

                        <div className="progress-bar-bg">
                            <div
                                className={`progress-bar-fill ${skill.assessed ? 'verified' : 'unverified'}`}
                                style={{ width: `${skill.progress}%` }}
                            ></div>
                        </div>

                        <div className="skill-status">
                            {skill.assessed ? (
                                <span className="status verified"><CheckCircle size={14} /> Verified</span>
                            ) : (
                                <span className="status unverified"><Clock size={14} /> Take Assessment</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Button className="btn-full mt-4">Add New Skill</Button>
        </section>
    );
};
