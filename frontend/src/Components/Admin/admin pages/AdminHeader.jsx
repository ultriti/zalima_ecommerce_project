import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';

const AdminHeader = () => {
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Use stored name if available
        const storedName = localStorage.getItem('userName');
        if (storedName) {
          setUserName(storedName);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <div className="fixed top-0 right-0 h-16 bg-white shadow-md z-10 flex items-center px-6 ml-64 w-[calc(100%-16rem)]">
      <div className="ml-auto relative">
        <button 
          className="flex items-center space-x-2 focus:outline-none"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="text-gray-700">{userName || 'Admin User'}</span>
          <FaUserCircle className="text-gray-700 text-xl" />
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
            <Link 
              to="/admin/profile" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaCog className="mr-2" />
              Profile Settings
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;