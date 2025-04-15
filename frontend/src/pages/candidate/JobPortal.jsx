import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import axios from "axios";
import "./JobPortal.css";

export default function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]); // Store job IDs of applied jobs
  const [isUploading, setIsUploading] = useState(false); // Track upload status
  const [uploadResult, setUploadResult] = useState(null); // Store match results

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:5000/getAlljobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data.jobs);
      } catch (error) {
        console.error("[ERROR] Fetching jobs:", error);
      }
    };

    const fetchAppliedJobs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:5000/get/applied/job", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.applied_jobs) {
          const appliedJobIds = response.data.applied_jobs.map(job => job.job_id); // Extract job IDs
          console.log("[DEBUG] Applied Jobs Fetched:", appliedJobIds);
          setAppliedJobs(appliedJobIds);
        }
      } catch (error) {
        console.error("[ERROR] Fetching applied jobs:", error);
      }
    };

    fetchJobs();
    fetchAppliedJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.recruiter_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog box for a specific job
  const handleOpenDialog = (jobId) => {
    setSelectedJobId(jobId);
    setOpenDialog(true);
  };

  // Close the dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
    setSelectedJobId(null);
    setUploadResult(null);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Submit the resume
  const handleSubmitResume = async () => {
    if (!selectedFile || !selectedJobId) {
      alert("Please select a file and a job!");
      return;
    }

    setIsUploading(true); // Start loading state
    setUploadResult(null); // Reset any previous results

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("job_id", selectedJobId);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post("http://127.0.0.1:5000/resume/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Store the match details for display
      setUploadResult(response.data.match_details || { message: response.data.message });
      
      // Refresh the applied jobs list to disable the button
      const updatedAppliedJobs = [...appliedJobs, selectedJobId];
      setAppliedJobs(updatedAppliedJobs);
      
      // Only close dialog if no detailed results to show
      if (!response.data.match_details) {
        handleCloseDialog();
      }
    } catch (error) {
      console.error("[ERROR] Uploading resume:", error);
      alert("Failed to upload resume.");
    } finally {
      setIsUploading(false); // End loading state regardless of success/failure
    }
  };

  // Render match details if available
  const renderMatchDetails = () => {
    if (!uploadResult) return null;
    
    return (
      <div className="match-results">
        <h3>Resume Match Results</h3>
        {uploadResult.match_score && (
          <p><strong>Match Score:</strong> {uploadResult.match_score.toFixed(1)}%</p>
        )}
        {uploadResult.skills_match && (
          <p><strong>Skills Match:</strong> {uploadResult.skills_match.toFixed(1)}%</p>
        )}
        {uploadResult.domain_match_level && (
          <p><strong>Domain Match Level:</strong> {uploadResult.domain_match_level}</p>
        )}
        <p className="success-message">Your application has been submitted successfully!</p>
      </div>
    );
  };

  return (
    <div className="job-portal-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <span>Resumai</span>
        </div>
        <TextField 
          placeholder="Search for jobs..." 
          className="search-input navbar-search" 
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="signin-btn">Logout</button>
      </nav>

      <div className="job-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="job-card">
              <CardContent>
                <h2 className="job-title">{job.job_title}</h2>
                <p className="Company">Company : {job.company}</p>
                <p className="job-salary">Status: {job.is_active ? 'Active' : 'Not Active'}</p>
                <Button 
                  className="apply-button" 
                  variant="contained" 
                  onClick={() => handleOpenDialog(job.id)}
                  disabled={appliedJobs.includes(job.id)} // Disable if already applied
                >
                  {appliedJobs.includes(job.id) ? "Already Applied" : "Apply Now"}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No jobs found</p>
        )}
      </div>

      {/* Upload Resume Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{uploadResult ? "Application Results" : "Upload Resume"}</DialogTitle>
        <DialogContent>
          {uploadResult ? (
            renderMatchDetails()
          ) : (
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx" 
              disabled={isUploading} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {uploadResult ? "Close" : "Cancel"}
          </Button>
          {!uploadResult && (
            <Button 
              onClick={handleSubmitResume} 
              variant="contained" 
              color="primary"
              disabled={isUploading || !selectedFile} // Disable if uploading or no file selected
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isUploading ? "Processing..." : "Submit"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
