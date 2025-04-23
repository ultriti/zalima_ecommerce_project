import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import googleicon from "../../../public/images/google_icon.svg";
import facebookicon from "../../../public/images/facebook_icon.svg";
import '../../index.css';
import {useGoogleLogin} from '@react-oauth/google';
import { googleAuth } from './app'; // Your API call function
import Navbar_frame from '../Common frames/Navbar_frame';
const Login_page = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [email_data, setemail_data] = useState('');
  const [password_data, setpassword_data] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: email_data,
      password: password_data,
      // role,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/login`, payload, {
        withCredentials: true,
      });

      if (response.status === 201) {
        alert('Logged in successfully');
        localStorage.setItem('token', response.data.token);
        // localStorage.setItem('role', role);
        // if(role === 'superadmin') {
        //   navigate('/admin/dashboard'); // Redirect to admin dashboard if needed
        // }
        // else{navigate('/');}
        navigate("/")
      }
    } catch (err) {
      alert("Login failed. Check your credentials.");
    }
  };
  const handleGoogleLogin = async (authResult) => {
    try{
      if(authResult.code){
        const res=await googleAuth(authResult.code); // send auth code to backend
        console.log("Google login success:", res.data);
        const { token} = res.data;
        localStorage.setItem("token", token);
        navigate("/");
      }else{
        console.warn("No auth code returned by Google");
      }
    }catch(error){
      console.error("Google login error:", error);
      alert("Google Login failed. Try again.");
    }
  };
  const google_login_function = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: () => alert("Google login failed"),
    flow: 'auth-code'
  });
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

            {/* Role Dropdown */}
            {/* <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select> */}

            {/* Email */}
            <input
              type="email"
              value={email_data}
              onChange={(e) => setemail_data(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />

            {/* Password / Code / Key Input */}
            <input
              type="password"
              value={password_data}
              onChange={(e) => setpassword_data(e.target.value)}
              placeholder={getLabel()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />

            {/* Forgot Password (Only for User) */}
            {role === 'user' && (
              <div className="text-right text-sm">
                <a href="/user/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Log In
            </button>

            {/* OTP Login */}
            {role === 'user' && (
              <button
                type="button"
                onClick={() => navigate('/user/login-otp')}
                className="w-full mt-2 border border-blue-500 text-blue-600 hover:bg-blue-100 font-semibold py-2 rounded-lg transition"
              >
                Log In via OTP
              </button>
            )}

            {/* Social Logins */}
            <div className="flex justify-center gap-4 pt-4">
              <button type="button" onClick={()=>google_login_function()} className="p-2 bg-white rounded-full shadow hover:scale-105 transition">
                <img src={googleicon} alt="Google" className="w-6 h-6" />
              </button>
              <button type="button" className="p-2 bg-white rounded-full shadow hover:scale-105 transition">
                <img src={facebookicon} alt="Facebook" className="w-6 h-6" />
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-sm text-gray-600 pt-4 text-center">
              Haven't created an account?
              <a href="/user/register" className="text-blue-600 hover:underline ml-1">Sign up</a>
            </p>
          </form>

          {/* Background Image */}
          <div className="ml-5 hidden md:block bg-[url('../../../public/images/register_page_bgc.svg')] bg-cover bg-center rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Login_page;
