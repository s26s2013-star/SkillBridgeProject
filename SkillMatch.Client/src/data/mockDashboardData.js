export const mockUser = {
    name: 'Alex Johnson',
    profileCompletion: 75,
    role: 'Student',
    email: 'alex.johnson@example.com',
    location: 'Remote',
    stats: {
        totalSkills: 12,
        assessmentsCompleted: 4,
        matchingScore: 88,
        availableJobs: 24,
    },
    topSkills: [
        { name: 'React', progress: 90, status: 'Verified', level: 'Advanced' },
        { name: 'JavaScript', progress: 85, status: 'Verified', level: 'Advanced' },
        { name: 'SQL', progress: 70, status: 'Pending', level: 'Intermediate' },
        { name: 'Problem Solving', progress: 95, status: 'Verified', level: 'Advanced' },
        { name: 'Communication', progress: 80, status: 'Not tested', level: 'Advanced' },
        { name: 'CSS/Tailwind', progress: 88, status: 'Verified', level: 'Advanced' },
        { name: 'Node.js', progress: 45, status: 'Not tested', level: 'Intermediate' },
        { name: 'PowerShell', progress: 30, status: 'Not tested', level: 'Beginner' },
    ],
    assessments: [
        { id: 1, name: 'React Fundamentals', status: 'Completed', score: 92, date: '2024-03-01' },
        { id: 2, name: 'Advanced JavaScript', status: 'Completed', score: 88, date: '2024-02-15' },
        { id: 3, name: 'System Design', status: 'Pending', score: null, date: null },
        { id: 4, name: 'SQL & Databases', status: 'In Progress', score: null, date: null },
        { id: 5, name: 'UI/UX Principles', status: 'Available', score: null, date: null },
    ],
    recommendedJobs: [
        {
            id: 1,
            title: 'Frontend Developer',
            company: 'TechNova',
            location: 'Remote',
            matchScore: 92,
            skills: ['React', 'JavaScript', 'CSS'],
            salary: '$80k - $120k',
            posted: '2 days ago',
            missingSkills: []
        },
        {
            id: 2,
            title: 'Full Stack Engineer',
            company: 'GlobalSystems Inc.',
            location: 'New York, NY',
            matchScore: 85,
            skills: ['React', 'Node.js', 'SQL'],
            salary: '$100k - $150k',
            posted: '3 days ago',
            missingSkills: ['Node.js']
        },
        {
            id: 3,
            title: 'React Native Developer',
            company: 'AppWorks',
            location: 'San Francisco, CA',
            matchScore: 78,
            skills: ['React', 'Mobile Dev', 'API'],
            salary: '$90k - $130k',
            posted: '1 week ago',
            missingSkills: ['Mobile Dev']
        },
        {
            id: 4,
            title: 'UI Developer',
            company: 'Creative Studio',
            location: 'London, UK',
            matchScore: 88,
            skills: ['React', 'CSS/Tailwind', 'Figma'],
            salary: '£60k - £80k',
            posted: '5 hours ago',
            missingSkills: ['Figma']
        },
    ],
    recentActivity: [
        { id: 1, text: 'Completed React Assessment', time: '2 days ago', type: 'success' },
        { id: 2, text: 'Added SQL to skills', time: '1 week ago', type: 'info' },
        { id: 3, text: 'Viewed Frontend Developer job', time: '1 week ago', type: 'info' },
    ]
};
