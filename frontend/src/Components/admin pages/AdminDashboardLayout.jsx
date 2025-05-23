import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminDashboard from './AdminDashboard';
import axios from 'axios';

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.role !== 'admin') {
          navigate('/admin/signin');
          return;
        }
        setAdmin(response.data);
      } catch (error) {
        navigate('/admin/signin');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen bg-gray-50">
        <AdminTopbar />
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminDashboardLayout;