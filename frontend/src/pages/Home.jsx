import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Toast from '../components/Toast';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token'); // Retrieve access token
        if (!token) {
          showToast('Please login to continue', 'error');
          setTimeout(() => navigate('/'), 1500);
          return;
        }
  
        const response = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send token in header
          }
        });
  
        if (response.status === 401) {
          showToast('Session expired, please login again', 'error');
          localStorage.removeItem('access_token'); // Remove invalid token
          setTimeout(() => navigate('/'), 1500);
          return;
        }
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        const data = await response.json();
        setUserData(data);
        localStorage.setItem('userData', JSON.stringify(data)); // Store user data
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load user data', 'error');
        setTimeout(() => navigate('/'), 1500);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
    
        localStorage.removeItem('access_token'); // Remove token on logout
        showToast('Logged out successfully', 'success');
        setTimeout(() => navigate('/'), 1500);
  
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="home-container">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="home-content">
        <h1>Welcome to Your Dashboard</h1>
        <div className="user-info">
          <h2>Your Profile</h2>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{userData.email}</span>
          </div>
          <div className="info-item">
            <span className="label">User ID:</span>
            <span className="value">{userData.id}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
