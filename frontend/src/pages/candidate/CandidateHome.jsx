import React from 'react';
import '../candidate/CandidateHome.css';
import { useNavigate } from 'react-router-dom';

const HiiredLandingPage = () => {

  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
    navigate("/"); // Redirect to login
  };



  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">
          <span>Resumai</span>
        </div>
        <button  onClick={handleLogout} className="signin-btn">Logout</button>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          <span style={{color: "#fff"}}>FIND.</span> <span className='water-text'>HIRED.</span>  <span style={{color: "#fff"}}>THRIVE.</span>
        </h1>
        <p className="hero-subtitle">
          Connect with top-tier company effortlessly. Whether you're scaling up or searching for specialized jobs roles, we've got the right job matches for your skills.
        </p>
        <div className="hero-buttons">
          <button onClick={() => navigate("/candidate/jobs")} className="btn-primary">See Job Openings</button>
        </div>
      </div>
    </div>
  );
};

export default HiiredLandingPage;