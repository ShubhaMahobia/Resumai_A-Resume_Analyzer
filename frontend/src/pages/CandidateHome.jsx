import React from 'react';
import '../pages/CandidateHome.css';

const HiiredLandingPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <span>HIIRED</span>
        </div>
        <div className="navbar-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Talents</a>
          <a href="#">Blog</a>
          <a href="#">Reach</a>
        </div>
        <button className="signin-btn">Sign In</button>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          <span>FIND.</span> HIIRED. <span>THRIVE.</span>
        </h1>
        <p className="hero-subtitle">
          Connect with top-tier talent effortlessly. Whether you're scaling up or searching for specialized skills, we've got the right professionals for your team.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Find Talent</button>
          <button className="btn-secondary">Get Hired</button>
        </div>
      </div>

      {/* Features Container */}
      <div className="features-container">
        {/* Talents Joined Section */}
        <div className="talents-section">
          <h3>143K</h3>
          <p>Top talents joined since Jan 25</p>
          <button className="join-btn">Join now →</button>
        </div>

        {/* Resume Review Section */}
        <div className="resume-review">
          <img 
            src="https://via.placeholder.com/300x200" 
            alt="Office Space" 
          />
          <div>
            <h3>Get your resume reviewed by the industry top engineers today</h3>
            <button className="btn-primary">Reserve a Call</button>
          </div>
        </div>

        {/* AI Matching Section */}
        <div className="ai-matching">
          <h3>AI-Powered Matching</h3>
          <p>Smart algorithms connect you with the best-fit candidates in minutes</p>
          <div>
            <span className="tag">UX Designer</span>
            <a href="#" className="text-white underline">See results</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiiredLandingPage;