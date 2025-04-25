import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setSecretKey('');
    setSecretKeyError('');
    setShowRoleModal(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmDelete(user);
  };

  const confirmRoleChange = async () => {
    setSecretKeyError('');
    
    if (!secretKey) {
      setSecretKeyError('Secret key is required');
      return;
    }
    
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${selectedUser._id}/role`,
        {
          role: newRole,
          secretKey: secretKey
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, role: newRole } : user
      ));
      
      setShowRoleModal(false);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      
      // Check if the error is specifically about the secret key
      if (error.response?.data?.message?.includes('secret key')) {
        setSecretKeyError(error.response.data.message || 'Invalid secret key');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update user role');
      }
    }
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}/api/users/${confirmDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Remove the user from the local state
      setUsers(users.filter(user => user._id !== confirmDelete._id));
      setConfirmDelete(null);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col w-full">
        <AdminHeader />
        <div className="ml-64 pt-20 p-6 w-full">
          <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
          
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={user.profileImage?.url || '/images/default-user.png'} 
                              alt={user.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'vendor' ? 'bg-green-100 text-green-800' : 
                              user.role === 'superadmin' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleRoleChange(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <FaUserShield className="inline mr-1" /> Change Role
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Role Change Modal */}
          {showRoleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Change User Role</h2>
                
                <div className="mb-4">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Current Role:</strong> {selectedUser.role}</p>
                  <p><strong>User ID:</strong> {selectedUser._id}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change to
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    {localStorage.getItem('userRole') === 'superadmin' && (
                      <option value="superadmin">Super Admin</option>
                    )}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className={`w-full p-2 border rounded focus:ring-2 focus:outline-none ${
                      secretKeyError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                    placeholder="Enter admin secret key"
                  />
                  {secretKeyError && (
                    <p className="mt-1 text-sm text-red-600">{secretKeyError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Required for security verification</p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRoleChange}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {confirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                
                <p className="mb-4">
                  Are you sure you want to delete the user <strong>{confirmDelete.name}</strong>?
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;