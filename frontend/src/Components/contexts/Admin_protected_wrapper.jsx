import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminProtectedWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAdminAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Check if user is admin or superadmin
        if (response.data.role === 'admin' || response.data.role === 'superadmin') {
          setIsAuthenticated(true);
        } else {
          toast.error('You do not have admin privileges');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Admin authentication error:', error);
        toast.error('Authentication failed');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/signin" />;
};

export default AdminProtectedWrapper;