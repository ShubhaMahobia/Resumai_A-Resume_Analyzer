import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './VerifyEmail.css';

const API_BASE_URL = "https://resumai-a-resume-analyzer-backend.onrender.com"; 

const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [debug, setDebug] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      console.log("Verifying email with token:", token);
      try {
        const response = await fetch(`${API_BASE_URL}/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'omit'
        });

        console.log("Response status:", response.status);
        
        // Handle non-JSON responses
        const responseText = await response.text();
        console.log("Response text:", responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          data = { Message: "Server response was not valid JSON" };
        }
        
        if (response.ok) {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified! You can now login to your account.');
        } else {
          setVerificationStatus('error');
          setDebug(`Status: ${response.status}, Response: ${responseText}`);
          setMessage(data.Message || 'Verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error("Error during verification:", error);
        setVerificationStatus('error');
        setDebug(`Error: ${error.message}`);
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className={`verify-icon ${verificationStatus}`}>
          {verificationStatus === 'loading' && <div className="loader"></div>}
          {verificationStatus === 'success' && <i className="checkmark">✓</i>}
          {verificationStatus === 'error' && <i className="error-mark">✗</i>}
        </div>
        <h1 className={verificationStatus}>{
          verificationStatus === 'loading' ? 'Verifying' :
          verificationStatus === 'success' ? 'Success' : 'Failed'
        }</h1>
        <p>{message}</p>
        
        {debug && <div className="debug-info"><small>{debug}</small></div>}
        
        <div className="action-buttons">
          {verificationStatus === 'success' && (
            <Link to="/" className="login-button">
              Login to your account
            </Link>
          )}
          
          {verificationStatus === 'error' && (
            <Link to="/" className="retry-button">
              Back to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 