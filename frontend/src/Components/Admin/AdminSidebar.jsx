import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaStore, FaUserShield, FaClipboardList, FaUserCog, FaTachometerAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white shadow-lg z-20">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-sm text-gray-400">
          {userRole === 'superadmin' ? 'Super Admin' : 'Admin'} Panel
        </p>
      </div>
      
      <nav className="mt-4">
        <ul>
          <li>
            <Link
              to="/admin/dashboard"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/dashboard') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/users') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <FaUsers className="mr-3" />
              Manage Users
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/vendors"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/vendors') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <FaStore className="mr-3" />
              Manage Vendors
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/vendor-requests"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/vendor-requests') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <FaClipboardList className="mr-3" />
              Vendor Requests
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/admins"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/admins') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <FaUserShield className="mr-3" />
              Manage Admins
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/profile"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/profile') 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <FaUserCog className="mr-3" />
              My Profile
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <Link 
          to="/"
          className="block text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Back to Site
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;