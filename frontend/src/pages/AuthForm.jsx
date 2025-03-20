import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';
import Toast from '../components/Toast';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (response.status === 409) {
        showToast('Email already exists', 'error');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        showToast(
          isLogin ? 'Successfully logged in!' : 'Account created successfully!',
          'success'
        );
        localStorage.setItem('userData', JSON.stringify(data));
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        showToast(data.error || 'Something went wrong', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-box">
          <div className="logo">RESUMAI.</div>
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              {isLogin ? 'Login' : 'Register Now'}
            </button>
          </form>
          <p className="toggle-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="welcome-content">
          <div className="logo">RESUMAI.</div>
          <h1>Hello, Friend!</h1>
          <p>Join us and let AI help you analyze and improve your resume.</p>
          <div className="social-links">
            <a href="#" className="social-link">f</a>
            <a href="#" className="social-link">t</a>
            <a href="#" className="social-link">g</a>
            <a href="#" className="social-link">in</a>
          </div>
        </div>
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default AuthForm; 