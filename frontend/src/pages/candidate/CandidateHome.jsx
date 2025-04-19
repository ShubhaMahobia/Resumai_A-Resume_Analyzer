import React, { useEffect } from 'react';
import '../candidate/CandidateHome.css';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';

const CandidateHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  // Scroll to top when component mounts

  return (
    <div className="home">

    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <span>Resumai</span>
        </div>
        <button onClick={handleLogout} className="signin-btn">
          Logout
        </button>
      </nav>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span>FIND.</span> <span className="water-text">Get Hired.</span> <span>THRIVE.</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top-tier companies effortlessly. Whether you're starting your career or seeking specialized roles, 
            we match your skills with the perfect opportunities.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/candidate/jobs")} className="btn-primary">
              <FaBriefcase style={{ marginRight: '8px' }} />
              Explore Job Openings
              <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
        <div className="hero-shape"></div>
      </section>
      {/* Features section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Find relevant positions based on your skills and experience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Skills Analysis</h3>
              <p>Get insights about your resume and improve your chances</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Quick Apply</h3>
              <p>Apply to multiple positions with a single click</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>With the help of AI</h3>
              <p>Get personalized job recommendations based on your profile</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
    </div>
    
  );
};

export default CandidateHome;