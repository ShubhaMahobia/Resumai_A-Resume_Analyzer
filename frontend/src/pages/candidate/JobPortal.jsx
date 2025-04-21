import React, { useState, useEffect } from "react";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { FaSearch, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./JobPortal.css";
import LoadingAnimation from "../../components/LoadingAnimation";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzeMode, setAnalyzeMode] = useState(false);


  const API_BASE_URL = "https://resumai-a-resume-analyzer-backend.onrender.com";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${API_BASE_URL}/getAlljobs`, {
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
        const response = await axios.get(`${API_BASE_URL}/get/applied/job`, {
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
    setAnalysisResult(null);
    setAnalyzeMode(false);
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
    setIsAnalyzing(true); // Also use the loading animation for submission
    setUploadResult(null);
    // Close dialog while processing
    setOpenDialog(false);

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("job_id", selectedJobId);

    try {
      const token = localStorage.getItem("access_token");
      // Ensure loading shows for at least 2.5 seconds
      const uploadStart = Date.now();
      
      const response = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Ensure loading animation shows for at least 2.5 seconds
      const uploadTime = Date.now() - uploadStart;
      if (uploadTime < 2500) {
        await new Promise(resolve => setTimeout(resolve, 2500 - uploadTime));
      }

      setUploadResult(response.data.match_details || { message: response.data.message });
      
      const updatedAppliedJobs = [...appliedJobs, selectedJobId];
      setAppliedJobs(updatedAppliedJobs);
      
      // Reopen the dialog with results
      setOpenDialog(true);
    } catch (error) {
      console.error("[ERROR] Uploading resume:", error);
      alert("Failed to upload resume.");
      // Reopen dialog on error
      setOpenDialog(true);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false); // Turn off the loading animation
    }
  };

  // Analyze the resume
  const handleAnalyzeResume = async () => {
    if (!selectedFile) {
      alert("Please select a resume file to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    // Close the dialog while analyzing
    setOpenDialog(false);

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("job_id", selectedJobId);

    try {
      const token = localStorage.getItem("access_token");
      // Simulate a minimum loading time to show the animation (at least 2.5 seconds)
      const analysisStart = Date.now();
      
      const response = await axios.post(`${API_BASE_URL}/analyze/resume/match`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Ensure loading animation shows for at least 2.5 seconds
      const analysisTime = Date.now() - analysisStart;
      if (analysisTime < 2500) {
        await new Promise(resolve => setTimeout(resolve, 2500 - analysisTime));
      }

      setAnalysisResult(response.data.match_details);
      // Reopen dialog with results
      setOpenDialog(true);
    } catch (error) {
      console.error("[ERROR] Analyzing resume:", error);
      alert("Failed to analyze resume.");
      // Reopen dialog on error
      setOpenDialog(true);
    } finally {
      setIsAnalyzing(false);
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
            className="analyze-button action-button" 
            variant="outlined"
            onClick={() => {
              setViewJobDetails(null);
              setAnalyzeMode(true);
              setSelectedJobId(viewJobDetails.id);
              setOpenDialog(true);
            }}
            style={{ marginBottom: '12px' }}
            startIcon={<FaSearch />}
          >
            Analyze Resume Match
          </Button>
          
          <Button 
            className="apply-button action-button" 
            variant="contained" 
            onClick={() => {
              setViewJobDetails(null);
              setAnalyzeMode(false);
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

  // Render analysis results if available
  const renderAnalysisResults = () => {
    if (!analysisResult) return null;
    
    return (
      <div className="analysis-results">
        <h3>Resume Match Analysis</h3>
        
        {analysisResult.match_score && (
          <div className="match-score-container">
            <div className="match-score-circle" style={{ 
              background: `conic-gradient(#4f46e5 ${analysisResult.match_score}%, #f3f4f6 0%)` 
            }}>
              <div className="match-score-inner">
                <span>{analysisResult.match_score.toFixed(1)}%</span>
              </div>
            </div>
            <p>Overall Job Match</p>
          </div>
        )}
        
        <div className="analysis-details-grid">
          {analysisResult.skills_match && (
            <div className="analysis-detail-item">
              <h4>Skills Match</h4>
              <p>{analysisResult.skills_match.toFixed(1)}%</p>
            </div>
          )}
          {analysisResult.domain_match_level && (
            <div className="analysis-detail-item">
              <h4>Domain Match</h4>
              <p>{analysisResult.domain_match_level}</p>
            </div>
          )}
        </div>
        
        {analysisResult.key_matching_skills && analysisResult.key_matching_skills.length > 0 && (
          <div className="matching-skills">
            <h4>Your Matching Skills</h4>
            <div className="skills-tags">
              {analysisResult.key_matching_skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="analysis-actions">
          <Button 
            className="apply-button" 
            variant="contained" 
            onClick={() => {
              setAnalyzeMode(false);
              setAnalysisResult(null);
            }}
            startIcon={<FaPaperPlane />}
          >
            Proceed to Apply
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="job-portal-container">
      {/* Loading Animation when analyzing */}
      {isAnalyzing && <LoadingAnimation />}
      
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
            : (
                analyzeMode 
                  ? (analysisResult ? "Resume Analysis Results" : "Analyze Resume Match") 
                  : (uploadResult ? "Application Results" : "Upload Resume")
              )
          }
        </DialogTitle>
        <DialogContent>
          {viewJobDetails && renderJobDetails()}
          
          {!viewJobDetails && analyzeMode && analysisResult && renderAnalysisResults()}
          
          {!viewJobDetails && !analyzeMode && uploadResult && renderMatchDetails()}
          
          {!viewJobDetails && !analysisResult && !uploadResult && (
            <div className="resume-upload-container">
              <p className="upload-instructions">
                {analyzeMode 
                  ? "Upload your resume to analyze how well it matches with this job position. This will not submit an application." 
                  : "Please upload your resume to apply for this position. Supported formats: PDF, DOC, DOCX"
                }
              </p>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  id="resume-upload"
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx" 
                  disabled={isUploading || isAnalyzing} 
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
            {uploadResult || analysisResult ? "Close" : "Cancel"}
          </Button>
          {!viewJobDetails && !uploadResult && !analysisResult && (
            <Button 
              onClick={analyzeMode ? handleAnalyzeResume : handleSubmitResume} 
              variant="contained" 
              color="primary"
              className="dialog-btn-primary"
              disabled={(analyzeMode && isAnalyzing) || (!analyzeMode && isUploading) || !selectedFile}
            >
              {analyzeMode 
                ? "Analyze Match"
                : "Submit Application"
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
