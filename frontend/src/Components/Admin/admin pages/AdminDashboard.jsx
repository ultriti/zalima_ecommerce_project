import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/admin/signin');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.role !== 'admin') {
          navigate('/unauthorized');
          return;
        }

        setAdmin(response.data);

        const usersResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const users = usersResponse.data;
        const userCount = users.filter(user => user.role === 'user').length;
        const vendorCount = users.filter(user => user.role === 'vendor').length;

        const productsResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStats({
          totalUsers: userCount,
          totalVendors: vendorCount,
          totalProducts: productsResponse.data.length || 0
        });
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchStats();
  }, [navigate]);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-gray-50">
        <AdminTopbar username={admin?.name || 'Admin'} />
        <div className="pt-24 px-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-10">Dashboard</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center max-w-3xl w-full">
              <span>
                <strong>Error:</strong> Failed to load dashboard statistics.
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 underline text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </span>
              <button
                onClick={() => window.location.reload()}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-2">
                <span className="text-3xl">👥</span>
              </div>
              <h2 className="text-gray-500 mb-1">Total Users</h2>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</p>
            </div>
            <div className="bg-green-100 p-8 rounded-2xl shadow-md flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-2">
                <span className="text-3xl">🏪</span>
              </div>
              <h2 className="text-gray-500 mb-1">Total Vendors</h2>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalVendors}</p>
            </div>
            <div className="bg-yellow-100 p-8 rounded-2xl shadow-md flex flex-col items-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-2">
                <span className="text-3xl">📦</span>
              </div>
              <h2 className="text-gray-500 mb-1">Total Products</h2>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalProducts}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link to="/admin/users" className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition">
              <div className="bg-blue-100 p-4 rounded-full mb-3">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
              <p className="text-blue-500 hover:underline">View Users</p>
            </Link>
            <Link to="/admin/vendors" className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition">
              <div className="bg-green-100 p-4 rounded-full mb-3">
                <span className="text-3xl">🏪</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Vendors</h3>
              <p className="text-blue-500 hover:underline">View Vendors</p>
            </Link>
            <Link to="/admin/managevendorrequests" className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition">
              <div className="bg-yellow-100 p-4 rounded-full mb-3">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Vendor Requests</h3>
              <p className="text-blue-500 hover:underline">Review Requests</p>
            </Link>
            <Link to="/admin/product-requests" className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition">
              <div className="bg-purple-100 p-4 rounded-full mb-3">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Product Requests</h3>
              <p className="text-blue-500 hover:underline">Review Product Requests</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;