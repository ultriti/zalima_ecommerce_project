import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar_frame from '../Common frames/Navbar_frame';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState({
    products: [],
    orders: [],
    stats: {
      totalProducts: 0,
      totalSales: 0,
      pendingOrders: 0
    }
  });

  useEffect(() => {
    // Check if user is logged in and is a vendor
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      toast.error('Please log in to access vendor dashboard');
      navigate('/user/signin');
      return;
    }
    
    if (userRole !== 'vendor') {
      toast.error('You do not have vendor privileges');
      navigate('/');
      return;
    }

    // Fetch vendor data
    fetchVendorData();
  }, [navigate]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would fetch actual vendor data
      // This is a placeholder for demonstration
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setVendorData({
        products: [
          { id: 1, name: 'Product 1', price: 19.99, stock: 10, status: 'active' },
          { id: 2, name: 'Product 2', price: 29.99, stock: 5, status: 'active' },
          { id: 3, name: 'Product 3', price: 39.99, stock: 0, status: 'out_of_stock' }
        ],
        orders: [
          { id: 101, date: '2023-10-15', customer: 'John Doe', total: 59.98, status: 'delivered' },
          { id: 102, date: '2023-10-16', customer: 'Jane Smith', total: 39.99, status: 'processing' }
        ],
        stats: {
          totalProducts: 3,
          totalSales: 99.97,
          pendingOrders: 1
        }
      });
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar_frame />
        <div className="max-w-7xl mx-auto p-6 mt-8">
          <div className="text-center py-10">
            <p>Loading vendor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_frame />
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
            <p className="text-3xl font-bold mt-2">{vendorData.stats.totalProducts}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
            <p className="text-3xl font-bold mt-2">${vendorData.stats.totalSales.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Pending Orders</h2>
            <p className="text-3xl font-bold mt-2">{vendorData.stats.pendingOrders}</p>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <button className="text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          {vendorData.orders.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendorData.orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Products</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Add New Product
            </button>
          </div>
          
          {vendorData.products.length === 0 ? (
            <p className="text-gray-500">No products yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendorData.products.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status === 'active' ? 'Active' : 
                           product.status === 'out_of_stock' ? 'Out of Stock' : 
                           'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Add Product Form Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/vendor/add-product')}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Add New Product
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">Update Inventory</h3>
              <p className="text-gray-600">Update stock levels for your products</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">View Analytics</h3>
              <p className="text-gray-600">See detailed sales and performance metrics</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">Manage Promotions</h3>
              <p className="text-gray-600">Create and manage special offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;