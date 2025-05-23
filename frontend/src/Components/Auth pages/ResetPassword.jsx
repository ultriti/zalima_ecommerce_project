import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import "../../index.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    console.log("🎯 handleResetPassword triggered with token:", token); // Debug log
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      console.log("❌ Password mismatch - Password:", password, "Confirm Password:", confirmPassword);
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password should be of at least 6 letters");
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Making API request to:", `${import.meta.env.VITE_BASE_URI}/api/users/reset-password/${token}`);
      const res = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/reset-password/${token}`, {
        password
      });
      console.log("✅ API response:", res.data);
      toast.success(res.data.message);
      setTimeout(() => navigate('/user/signin'), 2000);
    } catch (err) {
      console.error("❌ API error:", err);
      toast.error(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Reset Password</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-2 rounded`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <p className="text-sm text-center">
          <a href="/user/signin" className="text-blue-600 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;