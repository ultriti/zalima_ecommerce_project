import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
    // Check if user already has a vendor request
    checkExistingRequest();
  }, []);

  // Fix the API endpoint in checkExistingRequest
  const checkExistingRequest = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/vendors/my-request`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data) {
        setRequestStatus(response.data.status);
        
        // If there's pending or approved request, populate the form with existing data
        if (response.data.businessInfo) {
          setFormData(response.data.businessInfo);
        }
      }
    } catch (error) {
      console.error('Error checking vendor request status:', error);
      // No existing request is fine, we'll just show the form
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fix the API endpoint in handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.businessName || !formData.businessDescription || 
        !formData.contactPhone || !formData.businessAddress) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/vendors/request`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Vendor request submitted successfully');
      setRequestStatus('pending');
    } catch (error) {
      console.error('Error submitting vendor request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit vendor request');
    } finally {
      setLoading(false);
    }
  };

  // If user already has a request, show status instead of form
  if (requestStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Vendor Request Pending</h2>
          <p className="mb-4">Your request to become a vendor is currently under review.</p>
          <p className="text-sm text-gray-600">Our team will review your application and get back to you soon. This process typically takes 1-3 business days.</p>
        </div>
      </div>
    );
  }

  if (requestStatus === 'approved') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <h2 className="text-2xl font-bold text-green-700 mb-4">You're a Vendor!</h2>
          <p className="mb-4">Your vendor request has been approved.</p>
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Vendor Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (requestStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Vendor Request Rejected</h2>
          <p className="mb-4">Unfortunately, your request to become a vendor was not approved.</p>
          <p className="text-sm text-gray-600 mb-4">Reason: {requestStatus.rejectionReason || 'No specific reason provided.'}</p>
          <button
            onClick={() => setRequestStatus(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Become a Vendor</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-blue-800">
          Complete this form to apply for a vendor account. Our team will review your application and get back to you within 1-3 business days.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessName">
            Business Name *
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessDescription">
            Business Description *
          </label>
          <textarea
            id="businessDescription"
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactPhone">
            Contact Phone *
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessAddress">
            Business Address *
          </label>
          <textarea
            id="businessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taxId">
            Tax ID / Business Registration Number (Optional)
          </label>
          <input
            type="text"
            id="taxId"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Vendor Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorRequestForm;