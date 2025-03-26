import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecruiterHome = () => {

    const navigate = useNavigate();

const handleLogout = () => {
        localStorage.removeItem("access_token"); // Clear token
        navigate("/"); // Redirect to login
};
  return (
    <div className="home-container">
    <button className="btn" onClick={handleLogout}>Logout</button>
      <h1>Welcome, Recruiter!</h1>
      <p>Post job listings and find the best candidates for your company.</p>
      <button className="btn">Post a Job</button>
    </div>
  );
};

export default RecruiterHome;
