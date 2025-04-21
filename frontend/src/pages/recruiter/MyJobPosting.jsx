import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyJobPosting.css";

export default function MyJobPosting() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    

    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Using access_token instead of token
        
        if (!token) {
          navigate('/');
          return;
        }
        
        const API_BASE_URL = "https://resumai-a-resume-analyzer-backend.onrender.com";

        console.log("Fetching jobs with token:", token.substring(0, 10) + "...");
        
        const response = await axios.get(`${API_BASE_URL}/get/my/job`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("API Response:", response.data);
        
        if (response.data.jobs) {
          setJobs(response.data.jobs);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to fetch jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  const handleViewJobDetails = (jobId) => {
    navigate(`/recruiter/job/${jobId}`);
  };

  const handleViewCandidates = (jobId) => {
    // You can implement this functionality later
    navigate(`/recruiter/job/${jobId}/candidates`);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="job-portal-container">
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate('/recruiter/home')}>
          <span>Resumai</span>
        </div>
        <TextField
          placeholder="Search for jobs..."
          className="search-input navbar-search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="signin-btn" onClick={() => {
          localStorage.removeItem('access_token');
          navigate('/');
        }}>Logout</button>
      </nav>

      <div className="job-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.job_id} className="job-card">
              <CardContent>
                <h2 className="job-title">{job.job_title}</h2>
                <p className="job-details">{job.company} - {job.job_location}</p>
                <Button 
                  className="apply-button" 
                  variant="contained"
                  onClick={() => handleViewJobDetails(job.job_id)}
                >
                  View Job Details
                </Button>
                <div style={{height: '10px'}}></div>
                <Button 
                  className="apply-button" 
                  variant="contained"
                  onClick={() => handleViewCandidates(job.job_id)}
                >
                  View Candidates
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="no-jobs-message">No jobs found</p>
        )}
      </div>
    </div>
  );
}