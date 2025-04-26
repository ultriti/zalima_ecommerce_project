import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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

        if (response.data.role !== 'superadmin') {
          navigate('/admin/signin');
          return;
        }

        setUser(response.data);
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/admin/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin/signin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-64 min-h-screen">
        <div className="p-4">
          <h2 className="text-2xl font-bold">SuperAdmin</h2>
          <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link 
                to="/admin/dashboard" 
                className="flex items-center px-4 py-3 hover:bg-gray-700"
              >
                <span className="mr-2">📊</span> Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className="flex items-center px-4 py-3 hover:bg-gray-700"
              >
                <span className="mr-2">👥</span> Manage Users
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/admins" 
                className="flex items-center px-4 py-3 hover:bg-gray-700"
              >
                <span className="mr-2">🔑</span> Manage Admins
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/vendors" 
                className="flex items-center px-4 py-3 hover:bg-gray-700"
              >
                <span className="mr-2">🏪</span> Manage Vendors
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/products" 
                className="flex items-center px-4 py-3 hover:bg-gray-700"
              >
                <span className="mr-2">📦</span> Products
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className="flex items-center px-4 py-3 hover:bg-gray-700"
              >
                <span className="mr-2">🛒</span> Orders
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-700"
              >
                <span className="mr-2">🚪</span> Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">SuperAdmin Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-2">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;