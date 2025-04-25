import React from 'react'
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom'
import AuthForm from './pages/AuthForm'
import './App.css'
import CandidateHome from './pages/candidate/CandidateHome'
import RecruiterHome from './pages/recruiter/RecruiterHome'
import ProtectedRoute from './services/ProtectedRoute'
import JobPortal from './pages/candidate/JobPortal'
import JobPostingForm from './pages/recruiter/JobPostingForm'
import MyJobPosting from './pages/recruiter/MyJobPosting'
import ViewJobDetails from './pages/recruiter/viewJobDetails'
import JobCandidates from './pages/recruiter/JobCandidates'
import VerifyEmail from './pages/VerifyEmail'

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthForm />,
  },
  {
    path: "/verify-email/:token",
    element: <VerifyEmail />,
  },
  {
    element: <ProtectedRoute />, 
    children: [
      { path: "/candidate/home", element: <CandidateHome /> },
      { path: "/recruiter/home", element: <RecruiterHome /> },
      { path: "/candidate/jobs", element: <JobPortal /> },
      { path: "/recruiter/postJob", element: <JobPostingForm /> }, 
      { path: "/recruiter/myjobs", element: <MyJobPosting /> },
      { path: "/recruiter/job/:id", element: <ViewJobDetails /> },
      { path: "/recruiter/job/:jobId/candidates", element: <JobCandidates /> },
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
