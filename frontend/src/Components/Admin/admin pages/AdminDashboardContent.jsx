import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardContent = ({ stats }) => (
  <div className="ml-64 mt-16 p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-semibold mb-6">Welcome, Admin</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Total Users</h2>
        <p className="text-3xl font-bold">{stats.totalUsers}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Active Vendors</h2>
        <p className="text-3xl font-bold">{stats.totalVendors}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">Products Listed</h2>
        <p className="text-3xl font-bold">{stats.totalProducts}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-50 transition">
        <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
        <p>View and manage all users</p>
      </Link>
      <Link to="/admin/vendors" className="bg-white p-6 rounded-lg shadow-md hover:bg-green-50 transition">
        <h3 className="text-lg font-semibold mb-2">Manage Vendors</h3>
        <p>View and manage vendors</p>
      </Link>
      <Link to="/admin/vendor-requests" className="bg-white p-6 rounded-lg shadow-md hover:bg-yellow-50 transition">
        <h3 className="text-lg font-semibold mb-2">Vendor Requests</h3>
        <p>Review vendor applications</p>
      </Link>
      <Link to="/admin/product-requests" className="bg-white p-6 rounded-lg shadow-md hover:bg-purple-50 transition">
        <h3 className="text-lg font-semibold mb-2">Product Requests</h3>
        <p>Review product approval requests</p>
      </Link>
    </div>
  </div>
);

export default AdminDashboardContent;