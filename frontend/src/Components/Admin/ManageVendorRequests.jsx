import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from './AdminSidebar';

const ManageVendorRequests = () => {
  const [vendorRequests, setVendorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestStatus, setRequestStatus] = useState('pending');
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') || '';
    setCurrentUserRole(userRole);
    
    fetchVendorRequests();
  }, [requestStatus]);

  const fetchVendorRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/vendors/requests?status=${requestStatus}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setVendorRequests(response.data);
    } catch (error) {
      console.error('Error fetching vendor requests:', error);
      toast.error('Failed to load vendor requests');
      setVendorRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (action) => {
    if (!selectedRequest) return;
    
    try {
      const payload = {
        action: action
      };
      
      if (action === 'reject' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/vendors/requests/${selectedRequest._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(`Vendor request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setRejectionReason('');
      fetchVendorRequests();
    } catch (error) {
      console.error(`Error ${action}ing vendor request:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} vendor request`);
    }
  };

  const openModal = (request, action) => {
    setSelectedRequest({...request, action});
    setShowModal(true);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Manage Vendor Requests</h1>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setRequestStatus('pending')}
              className={`px-4 py-2 rounded ${requestStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setRequestStatus('approved')}
              className={`px-4 py-2 rounded ${requestStatus === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setRequestStatus('rejected')}
              className={`px-4 py-2 rounded ${requestStatus === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >
              Rejected
            </button>
          </div>
        </div>
        
        {loading ? (
          <p>Loading vendor requests...</p>
        ) : vendorRequests.length === 0 ? (
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-yellow-800">No {requestStatus} vendor requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">User ID</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Business Name</th>
                  <th className="py-2 px-4 border-b">Request Date</th>
                  {requestStatus === 'pending' && <th className="py-2 px-4 border-b">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vendorRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="py-2 px-4 border-b">{request._id}</td>
                    <td className="py-2 px-4 border-b">{request.name}</td>
                    <td className="py-2 px-4 border-b">{request.email}</td>
                    <td className="py-2 px-4 border-b">
                      {request.vendorRequest?.businessInfo?.businessName || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(request.vendorRequest?.requestDate).toLocaleDateString()}
                    </td>
                    {requestStatus === 'pending' && (
                      <td className="py-2 px-4 border-b">
                        {currentUserRole === 'superadmin' || currentUserRole === 'admin' ? (
                          <>
                            <button
                              onClick={() => openModal(request, 'approve')}
                              className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openModal(request, 'reject')}
                              className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500">Only admins can process requests</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Approval/Rejection Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {selectedRequest.action === 'approve' ? 'Approve' : 'Reject'} Vendor Request
              </h2>
              <div className="mb-4">
                <p><strong>Name:</strong> {selectedRequest.name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Business Name:</strong> {selectedRequest.vendorRequest?.businessInfo?.businessName || 'N/A'}</p>
                <p><strong>Business Description:</strong> {selectedRequest.vendorRequest?.businessInfo?.businessDescription || 'N/A'}</p>
              </div>
              
              {selectedRequest.action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection"
                    rows={3}
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestAction(selectedRequest.action)}
                  className={`px-4 py-2 ${
                    selectedRequest.action === 'approve' ? 'bg-green-500' : 'bg-red-500'
                  } text-white rounded`}
                  disabled={selectedRequest.action === 'reject' && !rejectionReason}
                >
                  {selectedRequest.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVendorRequests;