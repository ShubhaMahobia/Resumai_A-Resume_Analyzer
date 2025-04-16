import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Typography,
  CircularProgress, Box, Chip, Card
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const JobCandidates = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get(`http://127.0.0.1:5000/recruiter/job/${jobId}/candidates`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response.data);
        
        if (response.data && response.data.candidates) {
          // Sort candidates by match_score descending (high to low)
          const sortedCandidates = [...response.data.candidates].sort((a, b) => {
            // Treat null/undefined scores as lower than any number
            const scoreA = a.match_score ?? -Infinity;
            const scoreB = b.match_score ?? -Infinity;
            return scoreB - scoreA; // Sort descending
          });

          setCandidates(sortedCandidates);
          setJobDetails({
            jobId: response.data.job_id,
            jobTitle: response.data.job_title,
            candidatesCount: response.data.candidates_count
          });
        } else if (response.data) {
          // Handle case where response exists but candidates array might be missing or null
          setCandidates([]); 
          setJobDetails({
            jobId: response.data.job_id,
            jobTitle: response.data.job_title,
            candidatesCount: response.data.candidates_count || 0
          });
        } else {
          setError('Failed to fetch candidates or invalid data format');
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Error fetching candidates: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchCandidates();
    }
  }, [jobId, navigate]);

  const goBack = () => {
    navigate('/recruiter/myjobs');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Something went wrong</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{error}</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          variant="contained" 
          onClick={goBack}
          sx={{ mt: 3 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        variant="outlined" 
        onClick={goBack}
        sx={{ mb: 3 }}
      >
        Back to Jobs
      </Button>
      
      {jobDetails && (
        <Card sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>{jobDetails.jobTitle}</Typography>
          <Typography variant="subtitle1">
            Total Candidates: {jobDetails.candidatesCount || 0}
          </Typography>
        </Card>
      )}

      {candidates.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell>Match Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.application_id}>
                  <TableCell>{candidate.candidate_name}</TableCell>
                  <TableCell>{candidate.candidate_email}</TableCell>
                  <TableCell>{formatDate(candidate.application_date)}</TableCell>
                  <TableCell>
                    {candidate.match_score !== null ? 
                      `${Math.round(candidate.match_score)}%` : 
                      'Not available'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={candidate.status} 
                      color={getStatusColor(candidate.status)} 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => {
                        // Implement view resume functionality
                        console.log(`View resume for ${candidate.candidate_name}`);
                      }}
                    >
                      View Resume
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No candidates have applied for this job yet.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default JobCandidates; 