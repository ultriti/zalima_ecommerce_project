import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../index.css';
import { toast } from 'react-toastify';
const Login_otp_page = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Replace alert with toast
  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/otp/send`, { email });
      toast.success("OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      console.log('---> otp verification:',email,otp);
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/otp/verify`, { email, otp });
      localStorage.setItem('token', response.data.token);
      alert("OTP Verified Successfully");
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Login via OTP</h2>

        {/* Email input */}
        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full border border-gray-300 p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!otpSent ? (
          <button
            onClick={handleSendOTP}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <>
            {/* OTP input */}
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border border-gray-300 p-2 rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleVerifyOTP}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
              disabled={loading}
            >
              {loading ? "Verifying OTP..." : "Verify OTP & Login"}
            </button>
          </>
        )}

        <p className="text-sm text-center">
          <a href="/user/signin" className="text-blue-600 hover:underline">Back to normal login</a>
        </p>
      </div>
    </div>
  );
};

export default Login_otp_page;
