import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar_frame from '../Common frames/Navbar_frame';

const VendorRequestForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    contactPhone: '',
    businessAddress: '',
    taxId: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to request vendor status');
      navigate('/user/signin');
      return;
    }

    // Check current vendor request status
    checkVendorStatus();
  }, [navigate]);

  const checkVendorStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/my-request`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setRequestStatus(response.data.vendorRequest.status);
      
      // If user is already a vendor or has a pending request, show appropriate message
      if (response.data.isVendor) {
        toast.success('You are already a vendor!');
        navigate('/vendor/dashboard');
      } else if (response.data.vendorRequest.status === 'pending') {
        toast.info('You already have a pending vendor request');
      } else if (response.data.vendorRequest.status === 'rejected') {
        toast.error(`Your previous request was rejected: ${response.data.vendorRequest.rejectionReason}`);
      }
    } catch (error) {
      console.error('Error checking vendor status:', error);
      // If 404, it means no request exists yet, which is fine
      if (error.response?.status !== 404) {
        toast.error('Error checking vendor status');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.businessName || !formData.businessDescription || !formData.contactPhone || !formData.businessAddress) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      // Submit vendor request
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/request`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast.success('Vendor request submitted successfully!');
      setRequestStatus('pending');
    } catch (error) {
      console.error('Error submitting vendor request:', error);
      toast.error(error.response?.data?.message || 'Error submitting vendor request');
    } finally {
      setLoading(false);
    }
  };

  // If user already has a pending request, show status instead of form
  if (requestStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar_frame />
        <div className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Vendor Application Status</h1>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800">Your application is under review</h2>
            <p className="mt-4 text-gray-700">
              Thank you for your interest in becoming a vendor. Your application is currently being reviewed by our team.
              This process typically takes 1-3 business days. You will be notified via email once a decision has been made.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_frame />
      <div className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Become a Vendor</h1>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            Becoming a vendor allows you to sell products on our platform. Please provide accurate business information below.
            Our team will review your application and get back to you within 1-3 business days.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description *</label>
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Describe your business, products, and experience..."
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address *</label>
            <textarea
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID (Optional)</label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-blue-400"
            >
              {loading ? 'Submitting...' : 'Submit Vendor Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRequestForm;