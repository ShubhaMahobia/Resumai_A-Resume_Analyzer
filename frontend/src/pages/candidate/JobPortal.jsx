import React from "react";
import { Card, CardContent, Button, TextField, Select, MenuItem } from "@mui/material";
import { LogOut } from "lucide-react";
import "./JobPortal.css";

const jobs = [
  { id: 1, title: "Software Engineer", company: "Google", location: "Remote", salary: "$120k", type: "Full-time" },
  { id: 2, title: "Data Analyst", company: "Amazon", location: "New York, NY", salary: "$100k", type: "Full-time" },
  { id: 3, title: "UX Designer", company: "Meta", location: "San Francisco, CA", salary: "$110k", type: "Contract" },
  { id: 3, title: "UX Designer", company: "Meta", location: "San Francisco, CA", salary: "$110k", type: "Contract" },
  { id: 3, title: "UX Designer", company: "Meta", location: "San Francisco, CA", salary: "$110k", type: "Contract" },
  { id: 3, title: "UX Designer", company: "Meta", location: "San Francisco, CA", salary: "$110k", type: "Contract" }
];

export default function JobPortal() {
  return (
    <div className="job-portal-container">
      {/* Header */}
      <div className="header">
        <h1 className="title">Job Listings</h1>
        <Button variant="outlined" className="logout-button">
          <LogOut className="icon" /> Logout
        </Button>
      </div>

      {/* Filters (Search Bar + Select Dropdown) */}
      <div className="filters">
        <TextField placeholder="Search for jobs..." className="search-input" variant="outlined" />
        <Select className="filter-select" defaultValue="all">
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="full-time">Full-time</MenuItem>
          <MenuItem value="part-time">Part-time</MenuItem>
          <MenuItem value="remote">Remote</MenuItem>
        </Select>
      </div>

      {/* Job List - Flexbox for Side-by-Side Display */}
      <div className="job-list">
        {jobs.map((job) => (
          <Card key={job.id} className="job-card">
            <CardContent>
              <h2 className="job-title">{job.title}</h2>
              <p className="job-details">{job.company} - {job.location}</p>
              <p className="job-salary">{job.salary}</p>
              <p className="job-type">{job.type}</p>
              <Button className="apply-button" variant="contained">Apply Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
