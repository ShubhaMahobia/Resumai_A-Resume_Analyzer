import React, { useState, useEffect } from "react";
import "../recruiter/RecruiterHome.css";
import { useNavigate } from 'react-router-dom';
import JobPostingForm from '../recruiter/JobPostingForm';
// Icons would typically be imported from a library like react-icons
// For example: import { FaBriefcase, FaUser, FaSignOutAlt, FaPlus, FaChartLine } from 'react-icons/fa';

const RecruiterHome = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Add event listeners to handle browser back button
  useEffect(() => {
    // This will handle the back button in the browser
    const handleBackButton = (e) => {
      // Show the confirmation dialog
      setShowLogoutConfirm(true);
      
      // Push a new state to prevent immediate navigation
      window.history.pushState(null, "", window.location.pathname);
      
      // Prevent the default behavior
      e.preventDefault();
      
      // Return a message for the beforeunload event
      return (e.returnValue = "Are you sure you want to exit?");
    };

    // Add event listener for the popstate event (back/forward buttons)
    window.addEventListener("popstate", handleBackButton);
    
    // Add event listener for beforeunload (closing tab/refreshing)
    window.addEventListener("beforeunload", handleBackButton);
    
    // Push a state to the history stack to enable catching the back button
    window.history.pushState(null, "", window.location.pathname);

    // Cleanup function
    return () => {
      window.removeEventListener("popstate", handleBackButton);
      window.removeEventListener("beforeunload", handleBackButton);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
    navigate("/"); // Redirect to login
  };
  
  const handleMyJobPosting = () => {
    navigate("/recruiter/myjobs");
  };
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleSubmitJob = (formData) => {
    console.log("Submitting job data:", formData);
    // Here you would typically send the data to your backend API
    // API call would go here
    
    setIsDialogOpen(false);
    alert("Job posted successfully!");
  };

  return (
    <div className="recruiter-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Resumai</h2>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} 
              onClick={() => setActiveTab('dashboard')}>
            {/* <FaChartLine /> */} Dashboard
          </li>
          <li className={activeTab === 'myjobs' ? 'active' : ''} 
              onClick={handleMyJobPosting}>
            {/* <FaBriefcase /> */} My Postings
          </li>
          <li className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}>
            {/* <FaUser /> */} Profile
          </li>
          <li onClick={handleLogoutClick}>
            {/* <FaSignOutAlt /> */} Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h1>Welcome back, Recruiter!</h1>
          <p>Manage your job postings and find the perfect candidates.</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Active Jobs</h3>
            <p>Current open positions</p>
            <div className="stat">5</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Applications</h3>
            <p>Total applicants this month</p>
            <div className="stat">42</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Interviews</h3>
            <p>Scheduled this week</p>
            <div className="stat">8</div>
          </div>
        </div>

        <div className="job-card">
          <h1>Ready to find more talent?</h1>
          <p>Create a new job posting and let our AI find you the best matching candidates.</p>
          <button onClick={handleOpenDialog} className="job-button">
            {/* <FaPlus style={{ marginRight: '8px' }} /> */}
            Create a New Job Post
          </button>
        </div>
      </main>
      
      {/* Job Posting Dialog */}
      <JobPostingForm 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog} 
        onSubmit={handleSubmitJob} 
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Confirm Exit</h2>
            <p style={{ marginBottom: '30px', color: '#718096' }}>
              Are you sure you want to leave this page? Your session will be ended.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button 
                onClick={handleCancelLogout}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Stay on Page
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #3a63c8 0%, #5482e8 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  boxShadow: '0 4px 10px rgba(58, 99, 200, 0.3)'
                }}
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterHome;