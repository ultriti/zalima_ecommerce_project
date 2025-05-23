import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const VendorRequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [vendorRequest, setVendorRequest] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    contactPhone: '',
    businessAddress: '',
    taxId: ''
  });

  const checkExistingRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/user/login');
      return;
    }

    try {
      const response = await api.get('/api/vendor/my-request', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { vendorRequest: fetchedRequest, isVendor: vendorStatus } = response.data;

      const isValidVendorRequest = (
        fetchedRequest &&
        fetchedRequest.status &&
        fetchedRequest.businessInfo &&
        fetchedRequest.businessInfo.businessName &&
        fetchedRequest.businessInfo.businessDescription &&
        fetchedRequest.businessInfo.contactPhone &&
        fetchedRequest.businessInfo.businessAddress
      );

      if (isValidVendorRequest) {
        setVendorRequest(fetchedRequest);
        setRequestStatus(fetchedRequest.status);
        setFormData(fetchedRequest.businessInfo);
      } else {
        setVendorRequest(null);
        setRequestStatus(null);
      }
      setIsVendor(vendorStatus || false);
    } catch (error) {
      console.error('Error checking vendor request status:', error);
      if (error.response?.status === 404) {
        setVendorRequest(null);
        setRequestStatus(null);
        setIsVendor(false);
      } else {
        toast.error(error.response?.data?.message || 'Error checking vendor request status');
      }
    }
  };

  useEffect(() => {
    checkExistingRequest();
  }, [location.pathname]); // Re-run when the route changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to submit a vendor request');
      navigate('/user/login');
      return;
    }

    if (!formData.businessName || !formData.businessDescription || 
        !formData.contactPhone || !formData.businessAddress) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/vendor/request', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Vendor request submitted successfully');
      setVendorRequest({ status: 'pending', businessInfo: formData });
      setRequestStatus('pending');
    } catch (error) {
      console.error('Error submitting vendor request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit vendor request');
    } finally {
      setLoading(false);
    }
  };

  if (isVendor) {
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

  if (requestStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Vendor Request Rejected</h2>
          <p className="mb-4">Unfortunately, your request to become a vendor was not approved.</p>
          <p className="text-sm text-gray-600 mb-4">
            Reason: {vendorRequest?.rejectionReason || 'No specific reason provided.'}
          </p>
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