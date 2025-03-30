import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthForm from './pages/AuthForm'
import './App.css'
import CandidateHome from './pages/candidate/CandidateHome'
import RecruiterHome from './pages/recruiter/RecruiterHome'
import ProtectedRoute from './services/ProtectedRoute'
import JobPortal from './pages/candidate/JobPortal'
import JobPostingForm from './pages/recruiter/JobPostingForm'
import MyJobPosting from './pages/recruiter/MyJobPosting'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/candidate/home" element={<CandidateHome />} />
            <Route path="/recruiter/home" element={<RecruiterHome />} />
            <Route path="/candidate/jobs" element={<JobPortal />} />
            <Route path="/recuiter/postJob" element={<JobPostingForm />} />
            <Route path="/recuiter/myPosting" element={<MyJobPosting />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
