import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import facebookicon from "../../../public/images/facebook_icon.svg";
import googleicon from "../../../public/images/google_icon.svg";
import Navbar_frame from '../Common frames/Navbar_frame';
import { googleAuth, initiateGoogleAuth, facebookAuth, initiateFacebookAuth } from './app';

const Register_pages = () => {
  const [emaildata, setemaildata] = useState('');
  const [password_data, setpassword_data] = useState('');
  const [name_data, setname_data] = useState('');
  const [secret_data, setSecret] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectUri = 'http://localhost:5173/user/register';
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');
    const authProvider = localStorage.getItem('auth_provider'); // Add this line
    
    if (error) {
      console.error(`OAuth error: ${error}`);
      alert(`Login error: ${error}`);
      return;
    }
    
    if (state && storedState && state !== storedState) {
      console.error('OAuth state mismatch');
      alert('Security validation failed. Please try again.');
      return;
    }
    
    if (code) {
      console.log(`Code found in URL: ${code.substring(0, 10)}...`);
      
      const processAuth = async () => {
        try {
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
          
          // Clear OAuth state
          localStorage.removeItem('oauth_state');
          
          alert('Logged in successfully');
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // In the processAuth function where you handle successful authentication
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

  // ✅ Manual Registration
  const register_data_post_fun = async (e) => {
    e.preventDefault();

    const send_register_data = {
      email: emaildata,
      password: password_data,
      name: name_data,
      // secret:secret_data,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/users/register`,
        send_register_data,
        { withCredentials: true }
      );

      // Also update the register_data_post_fun function
      if (res.status === 201) {
        alert("User registered successfully");

        // Store token and user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data._id || '');
        localStorage.setItem("userRole", res.data.role || 'user');
        
        // Redirect to home page instead of profile page
        navigate("/");
      }
    } catch (err) {
      alert("Registration failed. Email might already be in use.");
      navigate("/user/register");
    }

    setemaildata('');
    setname_data('');
    setpassword_data('');
    setSecret('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar_frame />
      </div>

      {/* Register Section */}
      <div className="flex items-center justify-center min-h-[80vh] px-6 mt-10">
        <div className="grid md:grid-cols-2 bg-white/30 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-4xl animate-fade-in transition-all duration-500">
          
          {/* Optional Illustration */}
          <div className="mr-5 hidden md:block bg-[url('../../../public/images/register_page_bgc.svg')] bg-cover bg-center rounded-xl" />

          {/* Form */}
          <form onSubmit={register_data_post_fun} className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Sign Up</h2>

            <input
              type="text"
              value={name_data}
              onChange={(e) => setname_data(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="email"
              value={emaildata}
              onChange={(e) => setemaildata(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              value={password_data}
              onChange={(e) => setpassword_data(e.target.value)}
              placeholder="Password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Register
            </button>

            {/* Social Logins */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => initiateGoogleAuth(redirectUri)}
                className="p-2 bg-white rounded-full shadow hover:scale-105 transition"
              >
                <img src={googleicon} alt="Google" className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => initiateFacebookAuth(redirectUri)}
                className="p-2 bg-white rounded-full shadow hover:scale-105 transition"
              >
                <img src={facebookicon} alt="Facebook" className="w-6 h-6" />
              </button>
            </div>

            <p className="ml-25 text-sm text-gray-600 pt-4">
              Already have an account?
              <a href="/user/signin" className="text-blue-600 hover:underline ml-1">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register_pages;
