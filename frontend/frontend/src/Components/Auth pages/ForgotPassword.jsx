import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import "../../index.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // new loading state

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true); // set loading true

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/forgot-password`, { email });
      toast.success(res.data.message || "Reset email sent!");
      console.log("✅ Success:", res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
      console.error("❌ Error:", err);
    } finally {
      setLoading(false); // set loading false
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form onSubmit={handleForgotPassword} className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-[90%] max-w-md">
        <h2 className="text-2xl font-semibold text-blue-700">Forgot Password</h2>
        <input
          type="email"
          className="w-full border rounded-md px-3 py-2"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded-md`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
