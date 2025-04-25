import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalVendors: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch all users and count them by role
      const usersResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Count users by role
      const users = usersResponse.data;
      const userCount = users.filter(user => user.role === 'user').length;
      const adminCount = users.filter(user => user.role === 'admin' || user.role === 'superadmin').length;
      const vendorCount = users.filter(user => user.role === 'vendor').length;
      
      // Fetch products count
      const productsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setStats({
        totalUsers: userCount,
        totalAdmins: adminCount,
        totalVendors: vendorCount,
        totalProducts: productsResponse.data.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col w-full">
        <AdminHeader />
        <div className="ml-64 pt-20 p-6 w-full">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>
                <strong>Error:</strong> Failed to load dashboard statistics. 
                <button 
                  onClick={fetchDashboardStats} 
                  className="ml-2 underline text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </span>
              <button 
                onClick={() => setError(false)} 
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-gray-500">Total Users</h2>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <span className="text-2xl">🔐</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-gray-500">Total Admins</h2>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalAdmins}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="text-2xl">🏪</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-gray-500">Total Vendors</h2>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalVendors}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-gray-500">Total Products</h2>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <span className="text-3xl">👥</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
              <p className="text-blue-500 hover:underline">View Users</p>
            </Link>
            
            <Link to="/admin/vendors" className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <span className="text-3xl">🏪</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Vendors</h3>
              <p className="text-blue-500 hover:underline">View Vendors</p>
            </Link>
            
            <Link to="/admin/admins" className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <span className="text-3xl">🔐</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Admins</h3>
              <p className="text-blue-500 hover:underline">View Admins</p>
            </Link>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Environment</p>
                <p className="text-gray-600">{import.meta.env.MODE || 'development'}</p>
              </div>
              <div>
                <p className="font-semibold">API URL</p>
                <p className="text-gray-600">{import.meta.env.VITE_BASE_URI || 'Not configured'}</p>
              </div>
              <div>
                <p className="font-semibold">Version</p>
                <p className="text-gray-600">1.0.0</p>
              </div>
              <div>
                <p className="font-semibold">User Role</p>
                <p className="text-gray-600">{userRole || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;