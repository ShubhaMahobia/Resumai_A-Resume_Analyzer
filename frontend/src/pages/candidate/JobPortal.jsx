import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import axios from "axios";
import "./JobPortal.css";

export default function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:5000/getAlljobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
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

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("job_id", selectedJobId);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.put("http://127.0.0.1:5000/resume/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(response.data.message);
      handleCloseDialog();
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to upload resume.");
    }
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
                >
                  Apply Now
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
        <DialogTitle>Upload Resume</DialogTitle>
        <DialogContent>
          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitResume} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
