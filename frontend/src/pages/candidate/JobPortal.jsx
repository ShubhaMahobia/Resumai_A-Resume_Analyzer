import React, { useState } from "react";
import { Card, CardContent, Button, TextField } from "@mui/material";
import "./JobPortal.css";

const jobs = [
  { id: 1, title: "Software Engineer", company: "Google", location: "Remote", salary: "$120k", type: "Full-time" },
  { id: 2, title: "Data Analyst", company: "Amazon", location: "New York, NY", salary: "$100k", type: "Full-time" },
  { id: 3, title: "UX Designer", company: "Meta", location: "San Francisco, CA", salary: "$110k", type: "Contract" }
];

export default function JobPortal() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Job List - Flexbox for Side-by-Side Display */}
      <div className="job-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="job-card">
              <CardContent>
                <h2 className="job-title">{job.title}</h2>
                <p className="job-details">{job.company} - {job.location}</p>
                <p className="job-salary">Salary Range - {job.salary}</p>
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
