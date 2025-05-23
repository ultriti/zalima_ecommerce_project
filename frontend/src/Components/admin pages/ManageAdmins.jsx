import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from './AdminSidebar';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [targetRole, setTargetRole] = useState('user');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users?role=admin`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setTargetRole('user'); // Default to user when changing an admin's role
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
      
      toast.success(`Admin ${selectedUser.name} changed to ${targetRole} successfully`);
      setShowPromoteModal(false);
      setSecretKey('');
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error changing admin role:', error);
      toast.error(error.response?.data?.message || 'Failed to change admin role');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      fetchAdmins();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users/search?term=${value}&role=admin`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAdmins(response.data);
    } catch (error) {
      console.error('Error searching admins:', error);
      toast.error('Failed to search admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Manage Admins</h1>
        
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
          <p>Loading admins...</p>
        ) : admins.length === 0 ? (
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-yellow-800">No admins found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Admin ID</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Joined Date</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td className="py-2 px-4 border-b">{admin._id}</td>
                    <td className="py-2 px-4 border-b">{admin.name}</td>
                    <td className="py-2 px-4 border-b">{admin.email}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleChangeRole(admin)}
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

        {/* Change Role Modal */}
        {showPromoteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Change Admin Role</h2>
              <div className="mb-4">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Current Role:</strong> {selectedUser.role}</p>
                <p><strong>Admin ID:</strong> {selectedUser._id}</p>
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

export default ManageAdmins;