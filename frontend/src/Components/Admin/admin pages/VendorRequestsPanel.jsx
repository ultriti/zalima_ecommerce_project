import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorRequestsPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    // Check if user is admin or superadmin
    const userRole = localStorage.getItem('userRole');
    if (!userRole || (userRole !== 'admin' && userRole !== 'superadmin')) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }

    fetchVendorRequests();
  }, [navigate, filter]);

  const fetchVendorRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/requests?status=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching vendor requests:', error);
      toast.error('Failed to load vendor requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSelectedRequest(response.data);
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const handleProcessRequest = async (id, action) => {
    try {
      // For rejection, ensure reason is provided
      if (action === 'reject' && !rejectionReason) {
        toast.error('Please provide a reason for rejection');
        return;
      }

      const payload = {
        action,
        ...(action === 'reject' && { rejectionReason })
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/requests/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedRequest(null);
      fetchVendorRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${userId}/promote`,
        { role: 'vendor' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('User promoted to vendor successfully');
      setSelectedRequest(null);
      fetchVendorRequests();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error(error.response?.data?.message || 'Failed to promote user');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendor Requests</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600">No {filter} vendor requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(request.vendorRequest.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.vendorRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.vendorRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.vendorRequest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(request._id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                    {localStorage.getItem('userRole') === 'superadmin' && request.vendorRequest.status === 'pending' && (
                      <button
                        onClick={() => handlePromoteUser(request._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Promote to Vendor
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Vendor Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User Information</h3>
                  <p className="mt-1"><strong>Name:</strong> {selectedRequest.user.name}</p>
                  <p><strong>Email:</strong> {selectedRequest.user.email}</p>
                  <p><strong>Account Created:</strong> {new Date(selectedRequest.user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Business Information</h3>
                  <p className="mt-1"><strong>Business Name:</strong> {selectedRequest.vendorRequest.businessInfo.businessName}</p>
                  <p><strong>Description:</strong> {selectedRequest.vendorRequest.businessInfo.businessDescription}</p>
                  <p><strong>Phone:</strong> {selectedRequest.vendorRequest.businessInfo.contactPhone}</p>
                  <p><strong>Address:</strong> {selectedRequest.vendorRequest.businessInfo.businessAddress}</p>
                  {selectedRequest.vendorRequest.businessInfo.taxId && (
                    <p><strong>Tax ID:</strong> {selectedRequest.vendorRequest.businessInfo.taxId}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Request Status</h3>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.vendorRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedRequest.vendorRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedRequest.vendorRequest.status}
                    </span>
                  </p>
                  <p><strong>Request Date:</strong> {new Date(selectedRequest.vendorRequest.requestDate).toLocaleString()}</p>
                  {selectedRequest.vendorRequest.approvalDate && (
                    <p><strong>Approval Date:</strong> {new Date(selectedRequest.vendorRequest.approvalDate).toLocaleString()}</p>
                  )}
                  {selectedRequest.vendorRequest.rejectionReason && (
                    <p><strong>Rejection Reason:</strong> {selectedRequest.vendorRequest.rejectionReason}</p>
                  )}
                </div>
                
                {selectedRequest.vendorRequest.status === 'pending' && localStorage.getItem('userRole') === 'superadmin' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Process Request</h3>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleProcessRequest(selectedRequest.user._id, 'approve')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleProcessRequest(selectedRequest.user._id, 'reject')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                    
                    {/* Rejection reason input */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Required if rejecting the request..."
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRequestsPanel;