import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/api';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Briefcase, MapPin, Building2, AlertCircle } from 'lucide-react';

const STATIC_JOBS = {
    "Information System": [
        { title: "IT Business Analyst", company: "Omantel", location: "Muscat, Oman", description: "Bridge the gap between IT and business by gathering requirements and improving internal processes." },
        { title: "Database Administrator", company: "Bank Muscat", location: "Muscat, Oman", description: "Manage and optimize enterprise databases ensuring data integrity and high availability." },
        { title: "ERP Consultant", company: "Petroleum Development Oman", location: "Mina Al Fahal, Oman", description: "Implement and support SAP ERP systems for large-scale operations." },
        { title: "IT Project Manager", company: "Ooredoo Oman", location: "Muscat, Oman", description: "Lead tech projects from conception to deployment within budget and timelines." },
        { title: "Systems Analyst", company: "Ministry of Technology", location: "Muscat, Oman", description: "Analyze hardware and software systems to improve government business efficiency." }
    ],
    "Software Engineering": [
        { title: "Software Engineer", company: "Mulkia Investment", location: "Muscat, Oman", description: "Design, develop, and maintain software applications for enterprise financial clients." },
        { title: "Full Stack Developer", company: "Thawani Technologies", location: "Muscat, Oman", description: "Build scalable web applications using modern JavaScript frameworks for fintech startups." },
        { title: "Quality Assurance Engineer", company: "Awasr", location: "Seeb, Oman", description: "Ensure software reliability and performance through automated and manual testing." },
        { title: "Systems Architect", company: "Royal Oman Police", location: "Muscat, Oman", description: "Design complex IT architectures for government and corporate software infrastructure." },
        { title: "Mobile App Developer", company: "NBO", location: "Muscat, Oman", description: "Develop native iOS and Android applications for digital banking platforms." }
    ],
    "Network Computing": [
        { title: "Network Administrator", company: "Sohar Port and Freezone", location: "Sohar, Oman", description: "Manage and support LAN/WAN infrastructure for large logistics organizations." },
        { title: "Cloud Infrastructure Engineer", company: "Oman Data Park", location: "Muscat, Oman", description: "Deploy and maintain cloud networking solutions and virtualized environments." },
        { title: "Telecom Network Engineer", company: "Omantel", location: "Muscat, Oman", description: "Design and optimize telecommunications networks and 5G infrastructure." },
        { title: "Systems Administrator", company: "Sultan Qaboos University", location: "Al Khoudh, Oman", description: "Maintain server hardware, operating systems, and campus network services." },
        { title: "Network Security Specialist", company: "Central Bank of Oman", location: "Muscat, Oman", description: "Implement firewalls, VPNs, and intrusion detection systems to secure enterprise networks." }
    ],
    "Web & Mobile Technologies": [
        { title: "Frontend Developer", company: "Phaze Ventures", location: "Muscat, Oman", description: "Create responsive and dynamic user interfaces using React and modern CSS." },
        { title: "Backend Developer", company: "eMushrif", location: "Muscat, Oman", description: "Develop robust RESTful APIs and manage database operations using Node.js and .NET." },
        { title: "UI/UX Designer", company: "Oman Arab Bank", location: "Muscat, Oman", description: "Design intuitive digital experiences and user interfaces for mobile and web platforms." },
        { title: "E-Commerce Specialist", company: "Talabat Oman", location: "Muscat, Oman", description: "Build and maintain high-traffic online shopping platforms for regional businesses." },
        { title: "Mobile UI Engineer", company: "Nizwa Bank", location: "Muscat, Oman", description: "Focus on creating seamless interactive experiences for mobile touch interfaces." }
    ],
    "Web and Mobile Technologies": [ // Fallback alias
        { title: "Frontend Developer", company: "Phaze Ventures", location: "Muscat, Oman", description: "Create responsive and dynamic user interfaces using React and modern CSS." },
        { title: "Backend Developer", company: "eMushrif", location: "Muscat, Oman", description: "Develop robust RESTful APIs and manage database operations using Node.js and .NET." },
        { title: "UI/UX Designer", company: "Oman Arab Bank", location: "Muscat, Oman", description: "Design intuitive digital experiences and user interfaces for mobile and web platforms." },
        { title: "E-Commerce Specialist", company: "Talabat Oman", location: "Muscat, Oman", description: "Build and maintain high-traffic online shopping platforms for regional businesses." }
    ],
    "Cloud Computing": [
        { title: "Cloud Solutions Architect", company: "Oman Data Park", location: "Muscat, Oman", description: "Design comprehensive enterprise cloud environments and hybrid cloud migration strategies." },
        { title: "DevOps Engineer", company: "Omantel", location: "Muscat, Oman", description: "Automate CI/CD pipelines and infrastructure provisioning using Docker and Terraform." },
        { title: "Site Reliability Engineer", company: "Thawani", location: "Muscat, Oman", description: "Ensure high availability and fault tolerance of cloud-native financial applications." },
        { title: "Cloud Platform Engineer", company: "Asyad Group", location: "Muscat, Oman", description: "Manage and run containerized workloads on robust cloud infrastructures." },
        { title: "Cloud Security Engineer", company: "Bank Muscat", location: "Muscat, Oman", description: "Implement identity and access management for distributed cloud architectures." }
    ],
    "Data Science & AI": [
        { title: "Data Analyst", company: "OQ", location: "Muscat, Oman", description: "Interpret complex data sets and create business intelligence reports using PowerBI and SQL." },
        { title: "Machine Learning Engineer", company: "Petroleum Development Oman", location: "Muscat, Oman", description: "Develop predictive models and AI-driven solutions for the oil and logistics sectors." },
        { title: "Data Engineer", company: "Bank Dhofar", location: "Muscat, Oman", description: "Build scalable data pipelines and manage large-scale enterprise data warehouses." },
        { title: "AI Researcher", company: "Sultan Qaboos University", location: "Al Khoudh, Oman", description: "Research and implement natural language processing and computer vision applications." },
        { title: "Business Intelligence Developer", company: "Oman Air", location: "Muscat, Oman", description: "Design and develop enterprise reporting solutions and operational dashboards." }
    ],
    "Data Science and AI": [ // Fallback alias
        { title: "Data Analyst", company: "OQ", location: "Muscat, Oman", description: "Interpret complex data sets and create business intelligence reports using PowerBI and SQL." },
        { title: "Machine Learning Engineer", company: "Petroleum Development Oman", location: "Muscat, Oman", description: "Develop predictive models and AI-driven solutions for the oil and logistics sectors." },
        { title: "Data Engineer", company: "Bank Dhofar", location: "Muscat, Oman", description: "Build scalable data pipelines and manage large-scale enterprise data warehouses." },
        { title: "Business Intelligence Developer", company: "Oman Air", location: "Muscat, Oman", description: "Design and develop enterprise reporting solutions and operational dashboards." }
    ],
    "Cyber Security": [
        { title: "SOC Analyst", company: "Oman National CERT", location: "Muscat, Oman", description: "Monitor network traffic and detect national security incidents in real-time." },
        { title: "Penetration Tester", company: "Bank Muscat", location: "Muscat, Oman", description: "Conduct ethical hacking and vulnerability assessments for financial systems." },
        { title: "Information Security Manager", company: "Ooredoo Oman", location: "Muscat, Oman", description: "Develop and enforce security policies and ensure compliance with Oman's data protection laws." },
        { title: "Cyber Forensic Investigator", company: "Royal Oman Police", location: "Muscat, Oman", description: "Analyze digital evidence and respond to complex cyber incidents and breaches." },
        { title: "Cloud Security Architect", company: "Oman Data Park", location: "Muscat, Oman", description: "Design robust security controls for enterprise multi-cloud environments hosting sensitive data." }
    ]
};

export const Jobs = () => {
    const navigate = useNavigate();
    const [userMajor, setUserMajor] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Fallback to local storage if profile fetch isn't instantaneous
    const initialUser = authService.getCurrentUser() || {};

    useEffect(() => {
        if (!initialUser || !initialUser.email) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                // Fetch current user's profile to get specialization accurately
                const profileRes = await fetch(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(initialUser.email)}`);
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUserMajor(profileData.major ? profileData.major.trim() : null);
                } else {
                    setUserMajor(initialUser.major || null);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setUserMajor(initialUser.major || null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [initialUser?.email, navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Determine correct job list based on major matching
    const getRecommendedJobs = () => {
        if (!userMajor || userMajor === 'Not specified') return [];
        
        let foundKey = Object.keys(STATIC_JOBS).find(
            key => key.toLowerCase() === userMajor.toLowerCase() || 
                   key.toLowerCase().includes(userMajor.toLowerCase()) ||
                   userMajor.toLowerCase().includes(key.toLowerCase())
        );
        
        return foundKey ? STATIC_JOBS[foundKey] : [];
    };

    const recommendedJobs = getRecommendedJobs();

    if (loading) {
        return (
            <DashboardLayout user={initialUser} onLogout={handleLogout}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={initialUser} onLogout={handleLogout}>
            <div className="skills-page-container">
                <div className="section-header" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>Job Recommendations</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', margin: 0 }}>
                        Curated career opportunities matching your specialization in the local market.
                    </p>
                </div>

                {(!userMajor || userMajor === 'Not specified') ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                        <AlertCircle size={48} color="var(--color-warning)" style={{ margin: '0 auto 1.5rem auto' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Specialization Required</h3>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                            Please update your profile with a valid IT specialization to see curated job recommendations.
                        </p>
                    </div>
                ) : recommendedJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                        <AlertCircle size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>No Jobs Found</h3>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                            We couldn't find realistic job postings for the specialization "{userMajor}" right now.
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '2rem' }}>
                            Showing opportunities for: {userMajor}
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {recommendedJobs.map((job, index) => (
                                <div key={index} className="job-card animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                            <Briefcase size={24} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-success)', background: 'rgba(34, 197, 94, 0.1)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                                            Active Role
                                        </span>
                                    </div>
                                    
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                                        {job.title}
                                    </h4>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                            <Building2 size={16} /> <span style={{ fontWeight: 500 }}>{job.company}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                            <MapPin size={16} /> <span>{job.location}</span>
                                        </div>
                                    </div>
                                    
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, flexGrow: 1 }}>
                                        {job.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};
