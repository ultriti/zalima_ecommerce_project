import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const ManageProductRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      toast.error('Please log in to access this page');
      navigate('/admin/signin');
      return;
    }

    if (!['admin', 'superadmin'].includes(userRole?.toLowerCase())) {
      toast.error('You do not have permission to access this page');
      navigate('/unauthorized');
      return;
    }

    fetchAllVendorProducts();
    // eslint-disable-next-line
  }, [navigate, statusFilter, page]);

  const fetchAllVendorProducts = async () => {
    setLoading(true);
    try {
      const baseURL = import.meta.env.VITE_BASE_URI || 'http://localhost:5000';
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      };
      const queryParams = new URLSearchParams({
        page,
        limit: productsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      const res = await axios.get(
        `${baseURL}/api/products?${queryParams.toString()}`,
        config
      );
      setProducts(Array.isArray(res.data.products) ? res.data.products : res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      const message = error.response?.data?.message || 'Failed to load products. Please try again.';
      toast.error(message);
      setProducts([]);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (productId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;

    try {
      const baseURL = import.meta.env.VITE_BASE_URI || 'http://localhost:5000';
      await axios.put(
        `${baseURL}/api/products/${productId}`,
        {
          status: action === 'approve' ? 'active' : 'rejected',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      toast.success(`Product ${action}d successfully`);
      fetchAllVendorProducts();
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} product`);
    }
  };

  // const handleView = (productId) => {
  //   navigate(`/product/productsTemp/${productId}`);
  // };
  const handleView = (productId) => {
    navigate(`/admin/product-requests/${productId}/view`);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-gray-50">
        <AdminTopbar username="Admin" />
        <div className="pt-24 px-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Vendor Products</h1>
          {/* Status Filter */}
          <div className="flex items-center mb-6">
            <label className="text-sm font-medium text-gray-700 mr-2">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="pending-approval">Pending Approval</option>
              <option value="active">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {/* Products Table */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            {loading ? (
              <div className="text-center py-10">
                <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No products found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs" title={product.name}>
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs" title={product.vendor?.vendorRequest?.businessInfo?.businessName || product.vendor?.name || 'N/A'}>
                          {product.vendor?.vendorRequest?.businessInfo?.businessName || product.vendor?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleView(product._id)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            View
                          </button>
                          {product.status === 'pending-approval' && (
                            <>
                              <button
                                onClick={() => handleAction(product._id, 'approve')}
                                className="text-green-600 hover:text-green-900 mr-2"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(product._id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {product.status === 'active' && (
                            <span className="text-green-600">Approved</span>
                          )}
                          {product.status === 'rejected' && (
                            <span className="text-red-600">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProductRequests;