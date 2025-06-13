import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar_frame from '../Common frames/Navbar_frame';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    products: [],
    orders: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 5;

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    console.log('Token:', token);
    console.log('User Role:', userRole);

    if (!token) {
      toast.error('Please log in to access the dashboard');
      navigate('/user/signin');
      return;
    }

    if (userRole !== 'vendor') {
      toast.error('You do not have vendor privileges');
      navigate('/unauthorized');
      return;
    }

    fetchVendorData();
  }, [navigate, statusFilter, currentPage]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const baseURL = import.meta.env.VITE_BASE_URI || 'http://localhost:5000';
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: productsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      const [productResponse, orderResponse] = await Promise.all([
        axios.get(`${baseURL}/api/products/vendor/my-products?${queryParams.toString()}`, config),
        axios.get(`${baseURL}/api/orders/vendor/my-orders`, config),
      ]);

      const products = productResponse.data.products || [];
    const totalProducts = productResponse.data.totalProducts || 0;
    const totalPages = productResponse.data.totalPages || 1;

    const activeProducts = products.filter(p => p.status === 'active').length;
    const pendingProducts = products.filter(p => p.status === 'pending-approval').length;
    const rejectedProducts = products.filter(p => p.status === 'rejected').length;

    const orders = orderResponse.data;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'Processing').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    setVendorData({
      totalProducts,
      activeProducts,
      pendingProducts,
      rejectedProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      products,
      orders,
    });

    setTotalPages(totalPages);
  } catch (error) {
    console.error('Error fetching vendor data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/vendor/edit-product/${productId}`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/vendor/order/${orderId}`);
  };

  const chartData = {
    labels: ['Active Products', 'Pending Products', 'Rejected Products'],
    datasets: [
      {
        label: 'Product Status',
        data: [
          vendorData.activeProducts,
          vendorData.pendingProducts,
          vendorData.rejectedProducts,
        ],
        backgroundColor: ['#10B981', '#FBBF24', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#B91C1C'],
        borderWidth: 1,
      },
    ],
  };

  const orderChartData = {
    labels: ['Pending Orders', 'Completed Orders'],
    datasets: [
      {
        data: [vendorData.pendingOrders, vendorData.totalOrders - vendorData.pendingOrders],
        backgroundColor: ['#FBBF24', '#10B981'],
        borderColor: ['#D97706', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_frame />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        {/* Main Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Vendor Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage your products and track your business performance</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/vendor/add-product')}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </span>
            </button>

            <button
              onClick={() => navigate('/vendor/products')}
              className="px-6 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              View All Products
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-blue-600">{vendorData.totalProducts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-green-600">{vendorData.totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-yellow-600">${vendorData.totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Product Status</h3>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                <Pie data={orderChartData} options={chartOptions} />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Products</h3>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="pending-approval">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Price</th>
                      <th className="py-2 px-4 text-left">Stock</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorData.products.length > 0 ? (
                      vendorData.products.map((product) => (
                        <tr key={product._id} className="border-t">
                          <td className="py-2 px-4">{product.name}</td>
                          <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                          <td className="py-2 px-4">{product.countInStock}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : product.status === 'pending-approval'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <button
                              onClick={() => handleEditProduct(product._id)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left">Order ID</th>
                      <th className="py-2 px-4 text-left">Customer</th>
                      <th className="py-2 px-4 text-left">Total</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorData.orders.length > 0 ? (
                      vendorData.orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-t">
                          <td className="py-2 px-4">{order._id}</td>
                          <td className="py-2 px-4">{order.user.name || 'N/A'}</td>
                          <td className="py-2 px-4">${order.totalPrice.toFixed(2)}</td>
                          <td className="py-2 px-4">{order.status}</td>
                          <td className="py-2 px-4">
                            <button
                              onClick={() => handleViewOrder(order._id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>            
          </>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;