import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Logout_page = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout_function = async () => {
    console.log("Logout initiated");
    try {
      const logout_page = await api.post('/api/users/logout');
      if (logout_page.status === 200) {
        toast.success(logout_page.data.message);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/');
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!isLoggingOut) {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        setIsLoggingOut(true);
        logout_function();
      } else {
        navigate('/');
      }
    }
  }, [isLoggingOut, navigate]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout_page;