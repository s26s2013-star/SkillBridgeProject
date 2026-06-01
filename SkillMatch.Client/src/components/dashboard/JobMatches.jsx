import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const JobMatches = ({ email }) => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (!email) {
          setError('User email is missing. Please log in again.');
          return;
        }

        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/job-matches?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Complete assessment to see job matches');
        }

        const data = await response.json();
        setJobs(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Complete assessment to see job matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [email]);

  if (loading) {
    return (
      <div className="jm-container">
        <div className="jm-loading-pulse">
          <div className="jm-skeleton-title"></div>
          <div className="jm-skeleton-card"></div>
          <div className="jm-skeleton-card"></div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jm-container">
        <div className="jm-error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>{error}</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="jm-container">
      <div className="jm-header">
        <div className="jm-header-text">
          <h2>Top Job Matches</h2>
          <p>Personalized recommendations based on your unique skill profile.</p>
        </div>
        <div className="jm-header-badge">
          <span className="dot"></span> Powered by Oman Job Market Data
        </div>
      </div>
      
      <div className="jm-list">
        {jobs.map((match) => (
          <div key={match.rank} className="jm-card">
            {/* Score Ribbon */}
            <div className="jm-card-score" style={{ flexDirection: 'column', padding: '8px 16px', gap: '2px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{match.match_score}%</span>
                <span className="jm-fire">🔥</span>
              </div>
              {match.match_category && (
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.95, fontWeight: 700 }}>
                  {match.match_category}
                </span>
              )}
            </div>
            
            <div className="jm-card-content">
              <div className="jm-card-main">
                <h3 className="jm-job-title">{match.job.Job_Title}</h3>
                <p className="jm-job-company">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {match.job.Company} • {match.job.Location}
                </p>
                
                {match.match_message && (
                  <div style={{ background: 'rgba(111, 179, 167, 0.1)', color: '#266055', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    <span style={{ lineHeight: '1.4' }}>{match.match_message}</span>
                  </div>
                )}
                
                <div className="jm-breakdown-area">
                  <p className="jm-skills-label">Explainable Match Breakdown:</p>
                  <div className="jm-breakdown-grid">
                    <div className="jm-bd-row">
                      <div className="jm-bd-label">Tech</div>
                      <div className="jm-bd-score">{match.breakdown?.tech || 0}/40</div>
                      <div className="jm-bd-details">
                        {match.breakdown?.tech_details?.length > 0 ? match.breakdown.tech_details.join(" | ") : "No exact tech match"}
                      </div>
                    </div>
                    <div className="jm-bd-row">
                      <div className="jm-bd-label">Major</div>
                      <div className="jm-bd-score">{match.breakdown?.major || 0}/30</div>
                      <div className="jm-bd-details">
                        {match.breakdown?.major_details?.length > 0 ? match.breakdown.major_details.join(" | ") : "Different major"}
                      </div>
                    </div>
                    <div className="jm-bd-row">
                      <div className="jm-bd-label">Soft</div>
                      <div className="jm-bd-score">{match.breakdown?.soft || 0}/25</div>
                      <div className="jm-bd-details">
                        {match.breakdown?.soft_details?.length > 0 ? match.breakdown.soft_details.join(" | ") : "No exact soft match"}
                      </div>
                    </div>
                    <div className="jm-bd-row">
                      <div className="jm-bd-label">Exp</div>
                      <div className="jm-bd-score">{match.breakdown?.exp || 0}/5</div>
                      <div className="jm-bd-details">
                        {match.breakdown?.exp_details?.length > 0 ? match.breakdown.exp_details.join(" | ") : "Experience requirements vary"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="jm-card-actions">
                <a href={match.apply_url} target="_blank" rel="noopener noreferrer" className="jm-btn-apply">
                  Apply Now 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </a>
                
                {(match.match_category === 'Growth Match' || match.match_category === 'Explore Match') && (
                  <a href="/upskill-plan" className="jm-btn-learn">
                    Go to Learning Plan
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {jobs.length === 0 && (
          <div className="jm-empty-state">
            No suitable matches found at this time. Keep improving your skills!
          </div>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
.jm-container {
  background: white;
  border-radius: 24px;
  border: 1px solid #E5EEF0;
  padding: 2.5rem;
  box-shadow: 0 4px 24px rgba(46, 111, 126, 0.04);
  font-family: 'Inter', system-ui, sans-serif;
}

.jm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  border-bottom: 1px solid #F0F4F5;
  padding-bottom: 1.5rem;
}

.jm-header-text h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1F2D3D;
  margin: 0 0 0.5rem 0;
}

.jm-header-text p {
  color: #6B7C85;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.jm-header-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(111, 179, 167, 0.15);
  color: #2E6F7E;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
}

.jm-header-badge .dot {
  width: 8px;
  height: 8px;
  background: #6FB3A7;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(111, 179, 167, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(111, 179, 167, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(111, 179, 167, 0); }
  100% { box-shadow: 0 0 0 0 rgba(111, 179, 167, 0); }
}

.jm-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.jm-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #E5EEF0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.jm-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(46, 111, 126, 0.08);
  border-color: #6FB3A7;
}

.jm-card-score {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 8px 20px;
  border-bottom-left-radius: 16px;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: -2px 2px 12px rgba(255, 107, 107, 0.2);
  z-index: 10;
}

.jm-card-content {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.jm-card-main {
  flex: 1;
  padding-right: 2.5rem;
}

.jm-job-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1F2D3D;
  margin: 0 0 0.5rem 0;
  transition: color 0.2s;
}

.jm-card:hover .jm-job-title {
  color: #2E6F7E;
}

.jm-job-company {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6B7C85;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.jm-skills-area {
  margin-top: 1rem;
}

.jm-skills-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94A3B8;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
}

.jm-breakdown-area {
  margin-top: 1.25rem;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #E2E8F0;
}

.jm-breakdown-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.jm-bd-row {
  display: flex;
  align-items: baseline;
  font-size: 0.9rem;
}

.jm-bd-label {
  font-weight: 800;
  color: #475569;
  width: 55px;
}

.jm-bd-score {
  font-weight: 800;
  color: #2E6F7E;
  width: 55px;
  background: rgba(46, 111, 126, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  text-align: center;
  margin-right: 12px;
  font-size: 0.8rem;
}

.jm-bd-details {
  color: #266055;
  font-weight: 600;
  flex: 1;
}

.jm-card-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 1px dashed #E5EEF0;
  padding-left: 2.5rem;
  min-width: 220px;
}

.jm-btn-apply {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: #2E6F7E;
  color: white;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.05rem;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(46, 111, 126, 0.2);
}

.jm-btn-apply:hover {
  background: #255A66;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 111, 126, 0.3);
}

.jm-btn-learn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  color: #2E6F7E;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  padding: 12px;
  border: 1px solid #E5EEF0;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
  box-sizing: border-box;
}

.jm-btn-learn:hover {
  background: #F8FAFC;
  border-color: #6FB3A7;
  color: #266055;
  transform: translateY(-2px);
}

.jm-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748B;
  text-align: center;
}

.jm-error-state svg {
  width: 48px;
  height: 48px;
  color: #94A3B8;
  margin-bottom: 1rem;
}

.jm-empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748B;
  font-weight: 500;
  border: 2px dashed #E5EEF0;
  border-radius: 16px;
}

.jm-skeleton-title {
  height: 32px;
  width: 200px;
  background: #E5EEF0;
  border-radius: 8px;
  margin-bottom: 2rem;
  animation: sk-pulse 1.5s infinite ease-in-out;
}

.jm-skeleton-card {
  height: 180px;
  background: #F8FAFC;
  border: 1px solid #E5EEF0;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  animation: sk-pulse 1.5s infinite ease-in-out;
}

@keyframes sk-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
`;

export default JobMatches;
