import React, { useState, useEffect } from "react";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { FaSearch, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./JobPortal.css";

export default function JobPortal() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [viewJobDetails, setViewJobDetails] = useState(null);

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
          const appliedJobIds = response.data.applied_jobs.map(job => job.job_id);
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
    job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog box for a specific job
  const handleOpenDialog = (jobId) => {
    setSelectedJobId(jobId);
    setViewJobDetails(null);
    setOpenDialog(true);
  };

  // Close the dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
    setSelectedJobId(null);
    setUploadResult(null);
    setViewJobDetails(null);
  };

  // Open job details view
  const handleViewDetails = (job) => {
    setViewJobDetails(job);
    setOpenDialog(true);
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

    setIsUploading(true);
    setUploadResult(null);

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

      setUploadResult(response.data.match_details || { message: response.data.message });
      
      const updatedAppliedJobs = [...appliedJobs, selectedJobId];
      setAppliedJobs(updatedAppliedJobs);
    } catch (error) {
      console.error("[ERROR] Uploading resume:", error);
      alert("Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  // Render match details if available
  const renderMatchDetails = () => {
    if (!uploadResult) return null;
    
    return (
      <div className="match-results">
        <h3>Resume Match Results</h3>
        {uploadResult.match_score && (
          <div className="match-score-container">
            <div className="match-score-circle" style={{ 
              background: `conic-gradient(#4f46e5 ${uploadResult.match_score}%, #f3f4f6 0%)` 
            }}>
              <div className="match-score-inner">
                <span>{uploadResult.match_score.toFixed(1)}%</span>
              </div>
            </div>
            <p>Overall Match</p>
          </div>
        )}
        <div className="match-details-grid">
          {uploadResult.skills_match && (
            <div className="match-detail-item">
              <h4>Skills Match</h4>
              <p>{uploadResult.skills_match.toFixed(1)}%</p>
            </div>
          )}
          {uploadResult.domain_match_level && (
            <div className="match-detail-item">
              <h4>Domain Match</h4>
              <p>{uploadResult.domain_match_level}</p>
            </div>
          )}
        </div>
        <p className="success-message">Your application has been submitted successfully!</p>
      </div>
    );
  };
  
  // Render job details view
  const renderJobDetails = () => {
    if (!viewJobDetails) return null;
    
    return (
      <div className="job-details-container">
        <h2>{viewJobDetails.job_title}</h2>
        <div className="job-meta">
          <div className="job-meta-item">
            <FaBriefcase />
            <span>{viewJobDetails.company}</span>
          </div>
          <div className="job-meta-item">
            <FaMapMarkerAlt />
            <span>{viewJobDetails.job_location || 'Remote'}</span>
          </div>
          <div className="job-meta-item">
            <FaCalendarAlt />
            <span>Posted: {new Date(viewJobDetails.posted_on).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="job-description">
          <h3>Description</h3>
          <p>{viewJobDetails.job_description || 'No description available.'}</p>
        </div>
        
        <div className="job-details-section">
          <h3>Job Details</h3>
          <div className="job-details-grid">
            <div className="detail-item">
              <h4>Job Type</h4>
              <p>{viewJobDetails.job_type || 'Full-time'}</p>
            </div>
            <div className="detail-item">
              <h4>Experience</h4>
              <p>{viewJobDetails.experience_required || 'Not specified'}</p>
            </div>
            <div className="detail-item">
              <h4>Salary Range</h4>
              <p>{viewJobDetails.salary_range || 'Not disclosed'}</p>
            </div>
            <div className="detail-item">
              <h4>Status</h4>
              <p>{viewJobDetails.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
        
        {viewJobDetails.required_skills && (
          <div className="required-skills">
            <h3>Required Skills</h3>
            <div className="skills-tags">
              {viewJobDetails.required_skills.split(',').map((skill, index) => (
                <span key={index} className="skill-tag">{skill.trim()}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="job-actions">
          <Button 
            className="apply-button action-button" 
            variant="contained" 
            onClick={() => {
              setViewJobDetails(null);
              handleOpenDialog(viewJobDetails.id);
            }}
            disabled={appliedJobs.includes(viewJobDetails.id)}
            startIcon={<FaPaperPlane />}
          >
            {appliedJobs.includes(viewJobDetails.id) ? "Already Applied" : "Apply Now"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="job-portal-container">
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate('/candidate/home')}>
          <span>Resumai</span>
        </div>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <TextField 
            placeholder="Search for jobs, companies, or locations..." 
            className="search-input navbar-search" 
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>
        <button className="signin-btn" onClick={() => navigate('/candidate/home')}>Back to Home</button>
      </nav>

      <div className="jobs-header">
        <h1>Available Opportunities</h1>
        <p>{filteredJobs.length} Jobs Found</p>
      </div>

      <div className="jobs-table-container">
        <div className="jobs-table-header">
          <div className="job-col job-col-title">Job Title</div>
          <div className="job-col job-col-company">Company</div>
          <div className="job-col job-col-location">Location</div>
          <div className="job-col job-col-date">Posted On</div>
          <div className="job-col job-col-actions">Actions</div>
        </div>
        
        <div className="jobs-table-body">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="job-row">
                <div className="job-col job-col-title">
                  <h3>{job.job_title}</h3>
                  {job.required_skills && (
                    <div className="job-skills">
                      {job.required_skills.split(',').slice(0, 3).map((skill, index) => (
                        <span key={index} className="job-skill-pill">{skill.trim()}</span>
                      ))}
                      {job.required_skills.split(',').length > 3 && (
                        <span className="job-skill-pill job-skill-more">+{job.required_skills.split(',').length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="job-col job-col-company">{job.company}</div>
                <div className="job-col job-col-location">
                  <FaMapMarkerAlt className="job-icon" />
                  {job.job_location || 'Remote'}
                </div>
                <div className="job-col job-col-date">
                  <FaCalendarAlt className="job-icon" />
                  {new Date(job.posted_on).toLocaleDateString()}
                </div>
                <div className="job-col job-col-actions">
                  <button 
                    className="btn-view" 
                    onClick={() => handleViewDetails(job)}
                  >
                    <FaEye /> View
                  </button>
                  <button 
                    className={`btn-apply ${appliedJobs.includes(job.id) ? 'applied' : ''}`}
                    onClick={() => handleOpenDialog(job.id)}
                    disabled={appliedJobs.includes(job.id)}
                  >
                    <FaPaperPlane /> {appliedJobs.includes(job.id) ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs-found">
              <FaBriefcase className="no-jobs-icon" />
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for Upload Resume or View Job Details */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth={viewJobDetails ? "md" : "sm"}
      >
        <DialogTitle>
          {viewJobDetails 
            ? "Job Details" 
            : (uploadResult ? "Application Results" : "Upload Resume")}
        </DialogTitle>
        <DialogContent>
          {viewJobDetails && renderJobDetails()}
          
          {!viewJobDetails && uploadResult && renderMatchDetails()}
          
          {!viewJobDetails && !uploadResult && (
            <div className="resume-upload-container">
              <p className="upload-instructions">Please upload your resume to apply for this position. Supported formats: PDF, DOC, DOCX</p>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  id="resume-upload"
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx" 
                  disabled={isUploading} 
                  className="file-input"
                />
                <label htmlFor="resume-upload" className="file-label">
                  {selectedFile ? selectedFile.name : "Choose a file"}
                </label>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} className="dialog-btn-secondary">
            {uploadResult ? "Close" : "Cancel"}
          </Button>
          {!viewJobDetails && !uploadResult && (
            <Button 
              onClick={handleSubmitResume} 
              variant="contained" 
              color="primary"
              className="dialog-btn-primary"
              disabled={isUploading || !selectedFile}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isUploading ? "Processing..." : "Submit Application"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
