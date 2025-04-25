import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons';
import './AuthForm.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AuthForm = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 0
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Toggle between login and register
  const handleTogglePanel = (isRegister) => {
    setIsActive(isRegister);
    setErrorMessage('');
  };

  // API call for Registration
  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setLoading(false);

      if (response.status === 201) {
        alert("Registration successful! Please login.");
        setIsActive(false);
      } else {
        setErrorMessage(data.Message);
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Something went wrong. Try again.");
    }
  };

  // API call for Login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.status === 200) {
        localStorage.setItem("access_token", data.access_token);
        
        if (data.Role === 0) {
          navigate("/candidate/home");
        } else {
          navigate("/recruiter/home"); 
        }
      } else {
        setErrorMessage(data.Message);
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Something went wrong. Try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isActive) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`}>
      <div className='form-box login'>
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="input-box">
            <input 
              type="email" 
              name="email" 
              placeholder='Email' 
              required 
              value={formData.email}
              onChange={handleInputChange}
            />
            <box-icon type='solid' name='user'></box-icon>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              name="password" 
              placeholder='Password' 
              required 
              value={formData.password}
              onChange={handleInputChange}
            />
            <box-icon type='solid' name='lock'></box-icon>
          </div>
          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
          <button type='submit' className='btn' disabled={loading}>
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
      </div>

      <div className='form-box register'>
        <form onSubmit={handleSubmit}>
          <h1>Registration</h1>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="input-box">
            <input 
              type="text" 
              name="fullName" 
              placeholder='Full Name' 
              required 
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <box-icon type='solid' name='user'></box-icon>
          </div>
          <div className="input-box">
            <input 
              type="email" 
              name="email" 
              placeholder='Email' 
              required 
              value={formData.email}
              onChange={handleInputChange}
            />
            <box-icon type='solid' name='envelope'></box-icon>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              name="password" 
              placeholder='Password' 
              required 
              value={formData.password}
              onChange={handleInputChange}
            />
            <box-icon type='solid' name='lock'></box-icon>
          </div>
          <div className="role-toggle">
            <span className={formData.role === 0 ? 'active' : ''}>Candidate</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={formData.role === 1}
                onChange={() => setFormData(prev => ({...prev, role: prev.role === 0 ? 1 : 0}))}
              />
              <span className="slider round"></span>
            </label>
            <span className={formData.role === 1 ? 'active' : ''}>Recruiter</span>
          </div>
          <button type='submit' className='btn' disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>

      <div className="toggle-box">
        <div className='toggle-pannel toggle-left'>
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button 
            type="button" 
            className='btn register-btn' 
            onClick={() => handleTogglePanel(true)}
          >
            Register
          </button>
        </div>
        <div className='toggle-pannel toggle-right'>
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button 
            type="button" 
            className='btn login-btn' 
            onClick={() => handleTogglePanel(false)}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
