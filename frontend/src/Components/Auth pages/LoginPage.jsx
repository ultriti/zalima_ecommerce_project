import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import googleicon from "../../../public/images/google_icon.svg";
import facebookicon from "../../../public/images/facebook_icon.svg";
import '../../index.css';
import { googleAuth, initiateGoogleAuth, facebookAuth, initiateFacebookAuth } from './app';
import Navbar_frame from '../Common frames/Navbar_frame';
import { toast } from 'react-toastify';

const Login_page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('user');
  const [email_data, setemail_data] = useState('');
  const [password_data, setpassword_data] = useState('');
  
  // Define the redirect URI for auth
  const redirectUri = 'http://localhost:5173/user/signin';
  
  // Check for auth code in URL (after redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');
    const authProvider = localStorage.getItem('auth_provider'); // Add this line
    
    // Replace alerts with toast
    if (error) {
      console.error(`OAuth error: ${error}`);
      toast.error(`Login error: ${error}`);
      return;
    }
    
    // Replace other alerts
    if (state && storedState && state !== storedState) {
      console.error('OAuth state mismatch');
      toast.error('Security validation failed. Please try again.');
      return;
    }
    
    // Replace success alert
    toast.success('Logged in successfully');
    
    // Replace error alert
    toast.error('Login failed. Try again.');
    if (code) {
      console.log(`Code found in URL: ${code.substring(0, 10)}...`);
      
      // Process the code - determine if it's Google or Facebook
      const processAuth = async () => {
        try {
          // Use the stored provider instead of guessing based on URL parameters
          let res;
          if (authProvider === 'facebook') {
            console.log('Processing Facebook authentication...');
            res = await facebookAuth(code, redirectUri);
          } else {
            console.log('Processing Google authentication...');
            res = await googleAuth(code, redirectUri);
          }
          
          const { token, user_data } = res;
          
          localStorage.setItem('token', token);
          localStorage.setItem('userId', user_data._id);
          localStorage.setItem('userName', user_data.name);
          localStorage.setItem('userEmail', user_data.email);
          localStorage.setItem('userRole', user_data.role || 'user');
          
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('auth_provider');
          
          alert('Logged in successfully');
          
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (user_data.role === 'superadmin') {
            navigate('/admin/dashboard');
          } else if (user_data.role === 'vendor') {
            navigate('/vendor/dashboard');
          } else {
            // Redirect to home page instead of profile page
            navigate('/');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          alert('Login failed. Try again.');
        }
      };
      
      processAuth();
    }
  }, [location, navigate, redirectUri]);

  // Also update the regular login form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: email_data,
      password: password_data,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/login`, payload, {
        withCredentials: true,
      });

      if (response.status === 201) {
        alert('Logged in successfully');
        localStorage.setItem('token', response.data.token);
        
        // Get user role from response if available
        const userRole = response.data.role || 'user';
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', response.data._id || '');
        
        // Redirect based on user role
        if (userRole === 'superadmin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'vendor') {
          navigate('/vendor/dashboard');
        } else {
          // Redirect to home page instead of profile page
          navigate('/');
        }
      }
    } catch (err) {
      alert("Login failed. Check your credentials.");
    }
  };

  const getLabel = () => {
    switch (role) {
      case 'vendor':
        return 'Admin Code';
      case 'admin':
        return 'Super Admin Code';
      case 'superadmin':
        return 'Super Admin Secret Key';
      default:
        return 'Password';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar_frame />
      </div>

      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="grid md:grid-cols-2 bg-white/30 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-4xl animate-fade-in transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Sign In</h2>

            <input
              type="email"
              value={email_data}
              onChange={(e) => setemail_data(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="password"
              value={password_data}
              onChange={(e) => setpassword_data(e.target.value)}
              placeholder={getLabel()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Log In
            </button>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('auth_provider', 'google');
                  initiateGoogleAuth(redirectUri);
                }}
                className="p-2 bg-white rounded-full shadow hover:scale-105 transition"
              >
                <img src={googleicon} alt="Google" className="w-6 h-6" />
              </button>
              <button 
                type="button" 
                onClick={() => {
                  localStorage.setItem('auth_provider', 'facebook');
                  initiateFacebookAuth(redirectUri);
                }}
                className="p-2 bg-white rounded-full shadow hover:scale-105 transition"
              >
                <img src={facebookicon} alt="Facebook" className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 pt-4 text-center">
              Haven't created an account?
              <a href="/user/register" className="text-blue-600 hover:underline ml-1">Sign up</a>
            </p>
          </form>
          <div className="ml-5 hidden md:block login_img_div bg-[url('../../../public/images/register_page_bgc.svg')] bg-cover bg-center rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Login_page;
