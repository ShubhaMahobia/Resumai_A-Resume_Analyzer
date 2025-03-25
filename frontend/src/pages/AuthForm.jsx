import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons';
import './AuthForm.css';

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // Handle input changes
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
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login/registration logic here
    console.log(formData);
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`}>
      <div className='form-box login'>
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          <div className="input-box">
            <input 
              type="text" 
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
          <button type='submit' className='btn'>Login</button>
          <p>or login with social Platforms</p>
          {/* <div className="social-icons">
            <a href="#"><box-icon name='google' type='logo'></box-icon></a>
            <a href="#"><box-icon name='facebook' type='logo'></box-icon></a>
            <a href="#"><box-icon name='twitter' type='logo'></box-icon></a>
            <a href="#"><box-icon name='github' type='logo'></box-icon></a>
          </div> */}
        </form>
      </div>
      <div className='form-box register'>
        <form onSubmit={handleSubmit}>
          <h1>Registration</h1>
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
          <button type='submit' className='btn'>Register</button>
          <p>or register with social Platforms</p>
          {/* <div className="social-icons">
            <a href="#"><box-icon name='google' type='logo'></box-icon></a>
            <a href="#"><box-icon name='facebook' type='logo'></box-icon></a>
            <a href="#"><box-icon name='twitter' type='logo'></box-icon></a>
            <a href="#"><box-icon name='github' type='logo'></box-icon></a>
          </div> */}
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