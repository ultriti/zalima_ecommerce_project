import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
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
  const [loginMethod, setLoginMethod] = useState('email');
  const [email_data, setemail_data] = useState('');
  const [phone_data, setphone_data] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password_data, setpassword_data] = useState('');
  const isProcessing= useRef(false);

  const redirectUri = 'http://localhost:5173/user/signin';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');
    const authProvider = localStorage.getItem('auth_provider');

    if (error) {
      console.error(`OAuth error: ${error}`);
      toast.error(`Login error: ${error}`);
      return;
    }

    if (state && storedState && state !== storedState) {
      console.error('OAuth state mismatch');
      toast.error('Security validation failed. Please try again.');
      return;
    }

    if (code) {
      console.log(`Code found in URL: ${code.substring(0, 10)}...`);
      isProcessing.current = true;
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

          localStorage.removeItem('oauth_state');
          localStorage.removeItem('auth_provider');

          toast.success('Logged in successfully');

          window.history.replaceState({}, document.title, window.location.pathname);

          navigate(`/`);
        } catch (error) {
          console.error('Authentication error:', error);
          toast.error('Login failed. Try again.');
        }finally{
          isProcessing.current = false;
        }
      };

      processAuth();
    }
  }, [location, navigate, redirectUri]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      password: password_data,
    };
    if (loginMethod === 'email') {
      payload.email = email_data;
    } else {
      payload.phoneNumber = countryCode + phone_data;
    }

    try {
      const response = await api.post('/api/users/login', payload);
      if (response.status === 200) {
        toast.success('Logged in successfully');
        localStorage.setItem('token', response.data.token);
        const userRole = response.data.role || 'user';
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', response.data._id || '');
        navigate(`/`);
      }
    } catch (err) {
      toast.error("Login failed. Check your credentials.");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar_frame />
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-xl w-full max-w-5xl">
          {/* Form Section */}
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600 mb-4">Sign in to your Trendify account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login With</label>
                <select
                  value={loginMethod}
                  onChange={e => setLoginMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Number</option>
                </select>
              </div>
              {loginMethod === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email_data}
                    onChange={(e) => setemail_data(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex">
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      {/* Add more country codes as needed */}
                    </select>
                    <input
                      type="tel"
                      value={phone_data}
                      onChange={e => setphone_data(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{getLabel()}</label>
                <input
                  type="password"
                  value={password_data}
                  onChange={(e) => setpassword_data(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Log In
              </button>
            </form>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('auth_provider', 'google');
                  initiateGoogleAuth(redirectUri);
                }}
                className="p-3 bg-white rounded-full shadow-md hover:scale-105 transition-all duration-200"
              >
                <img src={googleicon} alt="Google" className="w-6 h-6" />
              </button>
              <button 
                type="button" 
                onClick={() => {
                  localStorage.setItem('auth_provider', 'facebook');
                  initiateFacebookAuth(redirectUri);
                }}
                className="p-3 bg-white rounded-full shadow-md hover:scale-105 transition-all duration-200"
              >
                <img src={facebookicon} alt="Facebook" className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-4 text-center">
              <a
                href="/user/forgot-password"
                className="text-blue-600 hover:underline text-sm"
              >
                Forgot Password?
              </a>
              <a
                href="/user/login-otp"
                className="text-blue-600 hover:underline text-sm"
              >
                Login with OTP
              </a>
              <p className="text-sm text-gray-600 pt-2">
                Don’t have an account?{' '}
                <a href="/user/register" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full h-80 rounded-xl overflow-hidden bg-gradient-to-br from-blue-300 to-blue-500">
              <img
                src="https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
                alt="Login Illustration"
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-300"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide the image if it fails to load
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <h3 className="text-white text-2xl font-semibold text-center drop-shadow-md">
                  Discover the Latest Trends with Trendify
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login_page;