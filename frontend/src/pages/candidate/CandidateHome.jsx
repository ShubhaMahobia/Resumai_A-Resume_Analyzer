import React, { useEffect, useState } from 'react';
import '../candidate/CandidateHome.css';
import { useNavigate, useBlocker } from 'react-router-dom';
import { FaBriefcase, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import Dialog from '../../components/Dialog';

const CandidateHome = () => {
  const navigate = useNavigate();
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: '' // 'logout' or 'navigation'
  });

  const performLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const handleLogout = () => {
    // Show logout confirmation dialog
    setDialogConfig({
      isOpen: true,
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout?',
      onConfirm: performLogout,
      type: 'logout'
    });
  };

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  // --- Back button/Navigation prompt ---
  const isLoggedIn = !!localStorage.getItem("access_token");

  let blocker = useBlocker(
    ({ nextLocation }) =>
      // Only block navigation that leaves the candidate section
      isLoggedIn && !nextLocation.pathname.startsWith('/candidate/')
  );

  // Handle the blocked navigation attempt
  useEffect(() => {
    if (blocker.state === "blocked") {
      setDialogConfig({
        isOpen: true,
        title: 'Leave Page',
        message: 'Are you sure you want to leave? You will be logged out.',
        onConfirm: () => {
          performLogout(); 
          blocker.proceed();
        },
        type: 'navigation'
      });
    }
  }, [blocker.state]);
  // --- End Back button/Navigation prompt ---

  // Effect to reset blocker if dialog is closed
  useEffect(() => {
    if (!dialogConfig.isOpen && dialogConfig.type === 'navigation' && blocker.state === "blocked") {
      blocker.reset();
    }
  }, [dialogConfig.isOpen, dialogConfig.type, blocker]);

  return (
    <div className="home">
      {/* Custom Dialog */}
      <Dialog 
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onConfirm={dialogConfig.onConfirm}
        onClose={closeDialog}
      />

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