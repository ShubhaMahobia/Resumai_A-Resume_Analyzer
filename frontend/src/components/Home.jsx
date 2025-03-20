import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Toast from './Toast';

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
        const response = await fetch('http://127.0.0.1:5000/profile', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.status === 401) {
          // Try to get data from localStorage
          const storedData = localStorage.getItem('userData');
          if (storedData) {
            setUserData(JSON.parse(storedData));
            setIsLoading(false);
            return;
          }
          showToast('Please login to view profile', 'error');
          setTimeout(() => {
            navigate('/');
          }, 1500);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        // Try to get data from localStorage
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        } else {
          showToast('Failed to load user data', 'error');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Clear localStorage on logout
        localStorage.removeItem('userData');
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error('Failed to logout');
      }
    } catch (error) {
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