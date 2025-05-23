import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../index.css';
import { toast } from 'react-toastify';

const Login_otp_page = () => {
  const [otpMethod, setOtpMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Send OTP
  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const payload = otpMethod === 'email'
        ? { email }
        : { phoneNumber: countryCode + phone };
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/otp/send`, payload);
      toast.success(response.data.message || "OTP sent");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const payload = otpMethod === 'email'
        ? { email, otp }
        : { phoneNumber: countryCode + phone, otp };
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/otp/verify`, payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role || 'user');
      localStorage.setItem('userId', response.data._id || '');
      if (response.data.name) localStorage.setItem('userName', response.data.name);
      if (response.data.email) localStorage.setItem('userEmail', response.data.email);

      toast.success("OTP Verified! You can now set a new password or skip.");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Set new password after OTP verification
  const handleSetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const payload = otpMethod === 'email'
        ? { email, newPassword, otp }
        : { phoneNumber: countryCode + phone, newPassword, otp };
      await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/reset-password-otp`, payload);
      toast.success("Password changed successfully! Logging you in...");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Skip password change and just log in
  const handleSkip = () => {
    toast.success("Logged in successfully!");
    navigate('/');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Login via OTP</h2>
        {/* Method selection */}
        {!otpSent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login With</label>
            <select
              value={otpMethod}
              onChange={e => setOtpMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Number</option>
            </select>
          </div>
        )}
        {/* Email or Phone input */}
        {!otpSent && otpMethod === 'email' && (
          <input
            type="email"
            placeholder="Enter your registered email"
            className="w-full border border-gray-300 p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        )}
        {!otpSent && otpMethod === 'phone' && (
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
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border-t border-b border-r border-gray-300 rounded-r-lg"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        )}
        {/* Send OTP button */}
        {!otpSent && (
          <button
            onClick={handleSendOTP}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        )}
        {/* OTP input */}
        {otpSent && !otpVerified && (
          <>
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
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </>
        )}
        {/* New password fields after OTP verification */}
        {otpVerified && (
          <>
            <input
              type="password"
              placeholder="Set new password"
              className="w-full border border-gray-300 p-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full border border-gray-300 p-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSetPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                disabled={loading}
              >
                {loading ? "Setting Password..." : "Set Password & Login"}
              </button>
              <button
                onClick={handleSkip}
                className="w-full bg-gray-200 hover:bg-gray-300 text-blue-700 font-semibold py-2 rounded"
                disabled={loading}
              >
                Skip
              </button>
            </div>
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