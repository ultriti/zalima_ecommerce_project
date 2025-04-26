import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from './AdminSidebar';

const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [targetRole, setTargetRole] = useState('user');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users?role=vendor`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.length === 0) {
        toast.info('No vendors found in the system');
      }
      
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = (user) => {
    setSelectedUser(user);
    setShowPromoteModal(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${selectedUser._id}/promote`,
        {
          role: targetRole,
          secretKey: secretKey
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(`User ${selectedUser.name} changed to ${targetRole} successfully`);
      setShowPromoteModal(false);
      setSecretKey('');
      fetchVendors(); // Refresh the list
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error(error.response?.data?.message || 'Failed to change user role');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      fetchVendors();
      return;
    }

    setLoading(true);
    try {
      // Search by any field (name, email, ID)
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users/search?term=${value}&role=vendor`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setVendors(response.data);
      
      if (response.data.length === 0) {
        toast.info('No vendors found matching your search');
      }
    } catch (error) {
      console.error('Error searching vendors:', error);
      toast.error('Failed to search vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Manage Vendors</h1>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by ID, name, or email"
            className="p-2 border rounded w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        {loading ? (
          <p>Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-yellow-800">No vendors found. Vendors will appear here once they are approved.</p>
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
                  <th className="py-2 px-4 border-b">Joined Date</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td className="py-2 px-4 border-b">{vendor._id}</td>
                    <td className="py-2 px-4 border-b">{vendor.name}</td>
                    <td className="py-2 px-4 border-b">{vendor.email}</td>
                    <td className="py-2 px-4 border-b">
                      {vendor.vendorRequest?.businessInfo?.name || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => window.location.href = `/vendor/products/${vendor._id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                      >
                        View Products
                      </button>
                      <button
                        onClick={() => handlePromoteUser(vendor)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Promote/Demote Modal */}
        {showPromoteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Change User Role</h2>
              <div className="mb-4">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Current Role:</strong> {selectedUser.role}</p>
                <p><strong>User ID:</strong> {selectedUser._id}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Change to</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Secret Key</label>
                <input 
                  type="password" 
                  className="w-full p-2 border rounded"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter secret key for verification"
                />
                <p className="text-xs text-gray-500 mt-1">Required for security verification</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSecretKey('');
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVendors;