import React, { useState } from "react";
import "../recruiter/RecruiterHome.css";
import { useNavigate } from 'react-router-dom';
import JobPostingForm from '../recruiter/JobPostingForm'

const RecruiterHome = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear token
    navigate("/"); // Redirect to login
  };
  const handleMyJobPosting = () => {
    navigate("/recuiter/myPosting");
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
    // For example:
    // fetch('/api/jobs', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    //   },
    //   body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Success:', data);
    //   // Maybe update the job list or show a success message
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });
    
    // For now, just show an alert
    alert("Job posted successfully!");
  };

  return (
    <div className="recruiter-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Resumai Job</h2>
        <ul>
          <li onClick={handleMyJobPosting} >My Postings</li>
          <li>Profile</li>
          <li onClick={handleLogout}> Logout </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="job-card">
          <h1>Welcome, Recruiter!</h1>
          <p>Create a new job post to find the best candidates.</p>
          <button onClick={handleOpenDialog} className="job-button">Create a New Job Post</button>
        </div>
      </main>
      
      {/* Job Posting Dialog */}
      <JobPostingForm 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog} 
        onSubmit={handleSubmitJob} 
      />
    </div>
  );
};

export default RecruiterHome;