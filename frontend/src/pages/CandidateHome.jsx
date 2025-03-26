import React from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
    navigate("/"); // Redirect to login
  };

  return (
    <div className="home-container">
      <button className="btn" onClick={handleLogout}>Logout</button>
      <p>Explore job opportunities and apply for positions that match your skills.</p>
      <button className="btn">Browse Jobs</button>
    </div>
  );
};

export default CandidateHome;
