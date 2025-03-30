import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, TextField } from "@mui/material";
import "./JobPortal.css";
import axios from "axios";

export default function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:5000/getAlljobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response)
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
                <Button className="apply-button" variant="contained">Apply Now</Button>
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
