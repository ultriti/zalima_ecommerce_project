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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/reset-password/${token}`, {
        password,
        confirmPassword
      });
      toast.success(res.data.message);
      navigate('/user/signin');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired token.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleResetPassword} className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-[90%] max-w-md">
        <h2 className="text-2xl font-semibold text-green-700">Reset Password</h2>
        <input
          type="password"
          className="w-full border rounded-md px-3 py-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border rounded-md px-3 py-2"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
