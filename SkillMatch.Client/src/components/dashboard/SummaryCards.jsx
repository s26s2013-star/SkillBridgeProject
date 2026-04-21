import React from 'react';
import { Award, Target, LineChart, Briefcase } from 'lucide-react';

export const SummaryCards = ({ stats }) => {
    const cards = [
        {
            title: 'Total Skills Added',
            value: stats.totalSkills,
            icon: Award,
            color: 'blue'
        },
        {
            title: 'Assessments Completed',
            value: stats.assessmentsCompleted,
            icon: Target,
            color: 'green'
        },
        {
            title: 'Matching Score',
            value: `${stats.matchingScore}%`,
            icon: LineChart,
            color: 'blue'
        },
        {
            title: 'Available Job Matches',
            value: stats.availableJobs,
            icon: Briefcase,
            color: 'green'
        }
    ];

    return (
        <section className="summary-cards">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="summary-card">
                        <div className={`icon-wrapper ${card.color}`}>
                            <Icon size={24} />
                        </div>
                        <div className="card-content">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};
