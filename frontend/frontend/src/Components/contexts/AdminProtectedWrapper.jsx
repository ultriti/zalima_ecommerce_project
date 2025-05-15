import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminProtectedWrapper = ({ children }) => {
  const [authAdmin, setAuthAdmin] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // assuming you're storing role in localStorage

  useEffect(() => {
    if (token && role === 'admin') {
      setAuthAdmin(true);
    } else {
      setAuthAdmin(false);
      toast.error('You must be an admin to access this page');
      navigate('/admin/dashboard');
    }
  }, [token, role, navigate]);

  return authAdmin ? <>{children}</> : null;
};

export default AdminProtectedWrapper;
