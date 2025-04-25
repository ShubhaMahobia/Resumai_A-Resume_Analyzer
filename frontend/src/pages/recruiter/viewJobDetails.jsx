import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import './ViewJobDetails.css';

const ViewJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.log("No token found");
          navigate('/');
          return;
        }

        console.log("Fetching job details for ID:", id);
        console.log("Using token:", token.substring(0, 10) + "...");

        const API_BASE_URL = import.meta.env.VITE_API_URL;

        const response = await axios.get(`${API_BASE_URL}/recruiter/job/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("API Response:", response.data);

        if (response.data.success) {
          setJob(response.data.job);
        } else {
          setError('Failed to fetch job details');
        }
      } catch (err) {
        console.error("Error details:", err);
        setError('Error fetching job details: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id, navigate]);

  const goBack = () => {
    navigate('/recruiter/myjobs');
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Parse skills into array
  const getSkillsArray = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim());
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="no-job-container">
        <h3>Job not found</h3>
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="job-details-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button 
        className="back-button"
        onClick={goBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft /> Go Back
      </motion.button>

      <motion.div 
        className="job-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1>{job.job_title}</h1>
        <div className="company-name">{job.company}</div>
        
        <div className="job-meta">
          <div className="meta-item">
            <FaMapMarkerAlt /> {job.job_location}
          </div>
          <div className="meta-item">
            <FaBriefcase /> {job.job_type}
          </div>
          <div className="meta-item">
            <FaCalendarAlt /> Posted: {formatDate(job.created_at)}
          </div>
        </div>
      </motion.div>

      <div className="job-content">
        <motion.div 
          className="content-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2>Job Description</h2>
          <div className="description-content">
            {job.job_description.split('\n').map((paragraph, index) => (
              paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="content-section skills-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2>Required Skills</h2>
          <div className="skills-list">
            {getSkillsArray(job.key_skills).map((skill, index) => (
              <motion.div 
                key={index} 
                className="skill-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (index * 0.05), duration: 0.3 }}
                whileHover={{ scale: 1.05, backgroundColor: 'var(--primary-dark)' }}
              >
                <FaCheck className="skill-icon" /> {skill}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="content-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2>Job Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <h3>Location</h3>
              <p>{job.job_location}</p>
            </div>
            <div className="summary-item">
              <h3>Job Type</h3>
              <p>{job.job_type}</p>
            </div>
            <div className="summary-item">
              <h3>Posted Date</h3>
              <p>{formatDate(job.created_at)}</p>
            </div>
            <div className="summary-item">
              <h3>Company</h3>
              <p>{job.company}</p>
            </div>
            <div className="summary-item">
              <h3>Status</h3>
              <p className={job.is_active ? "status-active" : "status-inactive"}>
                {job.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ViewJobDetails;
