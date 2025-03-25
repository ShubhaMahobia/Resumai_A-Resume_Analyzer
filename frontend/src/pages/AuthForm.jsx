import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';
import Toast from '../components/Toast';
import 'boxicons'



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

      const data = await response.json();
      if (response.ok) {
        showToast(
          isLogin ? 'Successfully logged in!' : 'Account created successfully!',
          'success'
        );

        if (isLogin && data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }

        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        showToast(data.Message || 'Something went wrong', 'error');
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


  const container = document.querySelector('.container');
  const registerButton = document.querySelector('.register-btn');
  const loginButton = document.querySelector('.login-btn');


  registerButton.addEventListener('click',() =>{
    container.classList.add('active')
  })

  loginButton.addEventListener('click',() =>{
    container.classList.remove('active')
  })

  return (
      <div className="container">
        <div className='form-box login' >
          <form action="">
            <h1>Login</h1>
            <div className="input-box">
               <input type="text" name="" id="" placeholder='Email' required />
               <box-icon type='solid' name='user'></box-icon>
            </div>
            <div className="input-box">
               <input type="password" name="" id="" placeholder='Password' required />
               <box-icon type='solid' name='user'></box-icon>
            </div>
            <div className="forgot-link">
              <a href="">Forgot password?</a>
            </div>
            <button type='submit' className='btn'>Login</button>
            <p>or login with social Platforms</p>
            <div className="social-icons">
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
            </div>
          </form>
        </div>
        <div className='form-box register' >
          <form action="">
            <h1>Registration</h1>
            <div className="input-box">
               <input type="text" name="" id="" placeholder='Full Name' required />
               <box-icon type='solid' name='user'></box-icon>
            </div>
            <div className="input-box">
               <input type="text" name="" id="" placeholder='Email' required />
               <box-icon type='solid' name='envelope'></box-icon>
            </div>
            <div className="input-box">
               <input type="password" name="" id="" placeholder='Password' required />
               <box-icon type='solid' name='user'></box-icon>
            </div>
            <button type='submit' className='btn'>Register</button>
            <p>or register with social Platforms</p>
            <div className="social-icons">
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
              <a href=""><box-icon name='google' type='logo' ></box-icon></a>
            </div>
          </form>
        </div>
        <div className="toggle-box">
          <div className='toggle-pannel toggle-left'>
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button className='btn register-btn'>Register</button>
          </div>
          <div className='toggle-pannel toggle-right'>
            <h1>Welcome! Back</h1>
            <p>Already have an account?</p>
            <button className='btn login-btn'>Login</button>
          </div>
        </div>
      </div>
  );
};

export default AuthForm;
