import React from "react";
import "./RecruiterHome.css";
import { useNavigate } from 'react-router-dom';

const RecruiterHome = () => {

  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
    navigate("/"); // Redirect to login
  };
  return (
    <div className="recruiter-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Resumai Job</h2>
        <ul>
          <li>My Postings</li>
          <li>Profile</li>
          <li onClick={handleLogout}> Logout </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="job-card">
          <h1>Welcome, Recruiter!</h1>
          <p>Create a new job post to find the best candidates.</p>
          <button className="job-button">Create a New Job Post</button>
        </div>
      </main>
    </div>
  );
};

export default RecruiterHome;
