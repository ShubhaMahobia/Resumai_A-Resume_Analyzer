import React, { useState } from 'react';
import '../recruiter/JobPostingForm.css';

const JobPostingForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    job_title: '',
    job_desc: '',
    key_skills: '',
    job_type: '',
    job_location: '',
    company: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_URL;  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.job_desc.trim()) newErrors.job_desc = 'Job description is required';
    if (!formData.key_skills.trim()) newErrors.key_skills = 'Key skills are required';
    if (!formData.job_type.trim()) newErrors.job_type = 'Job type is required';
    if (!formData.job_location.trim()) newErrors.job_location = 'Job location is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validate()) {
      console.log('Form has errors');
      return;
    }
  
    try {
      const token = localStorage.getItem("access_token");
      console.log(formData) // Get JWT token from storage
      const response = await fetch(`${API_BASE_URL}/recruiter/postjob`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send JWT for authentication
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Job posted successfully!");
        onSubmit(formData); // Call the parent function if needed
        setFormData({ // Reset form
          job_title: "",
          job_desc: "",
          key_skills: "",
          job_type: "",
          job_location: "",
          company: "",
          is_active: true
        });
        onClose();
      } else {
        alert(`Error: ${data.missing_fields}`);
      }
    } catch (error) {
      console.error("Error posting job:", error);
      alert("An error occurred while posting the job.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h2>Post a New Job</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="job-posting-form">
          <div className="form-group">
            <label htmlFor="job_title">Job Title</label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              placeholder="e.g. Senior React Developer"
              className={errors.job_title ? 'error' : ''}
            />
            {errors.job_title && <span className="error-message">{errors.job_title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Tech Solutions Inc."
              className={errors.company ? 'error' : ''}
            />
            {errors.company && <span className="error-message">{errors.company}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="job_type">Job Type</label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className={errors.job_type ? 'error' : ''}
              >
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
              {errors.job_type && <span className="error-message">{errors.job_type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="job_location">Job Location</label>
              <input
                type="text"
                id="job_location"
                name="job_location"
                value={formData.job_location}
                onChange={handleChange}
                placeholder="e.g. New York, NY or Remote"
                className={errors.job_location ? 'error' : ''}
              />
              {errors.job_location && <span className="error-message">{errors.job_location}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="job_desc">Job Description</label>
            <textarea
              id="job_desc"
              name="job_desc"
              value={formData.job_desc}
              onChange={handleChange}
              placeholder="Provide a detailed description of the job..."
              rows="5"
              className={errors.job_desc ? 'error' : ''}
            ></textarea>
            {errors.job_desc && <span className="error-message">{errors.job_desc}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="key_skills">Key Skills</label>
            <textarea
              id="key_skills"
              name="key_skills"
              value={formData.key_skills}
              onChange={handleChange}
              placeholder="List required skills separated by commas..."
              rows="3"
              className={errors.key_skills ? 'error' : ''}
            ></textarea>
            {errors.key_skills && <span className="error-message">{errors.key_skills}</span>}
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label htmlFor="is_active">Make this job posting active immediately</label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-button">Post Job</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;