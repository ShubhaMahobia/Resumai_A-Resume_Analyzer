import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, TextField } from "@mui/material";
import axios from "axios";
import "./MyJobPosting.css";

export default function MyJobPosting() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Assuming JWT token is stored here
        const response = await axios.get("http://127.0.0.1:5000/get/my/job/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJobs(response.data.jobs);
      } catch (err) {
        setError("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {loading ? (
          <p>Loading jobs...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.job_id} className="job-card">
              <CardContent>
                <h2 className="job-title">{job.job_title}</h2>
                <p className="job-details">{job.company} - {job.job_location}</p>
                <Button className="apply-button" variant="contained">View Job Details</Button>
                <div style={{height: '10px'}}></div>
                <Button className="apply-button" variant="contained">View Candidates</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No jobs found</p>
        )}
      </div>
    </div>
  );
}