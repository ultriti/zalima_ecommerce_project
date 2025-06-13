import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar_frame from '../Common frames/Navbar_frame';

const ManageSuperAdminProductRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending-approval');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      toast.error('Please log in to access this page');
      navigate('/admin/signin');
      return;
    }

    if (userRole !== 'superadmin') {
      toast.error('You do not have permission to access this page');
      navigate('/unauthorized');
      return;
    }

    fetchProductRequests();
  }, [navigate, statusFilter, page]);

  const fetchProductRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products/pending?page=${page}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching product requests:', error);
      const message = error.response?.data?.message || 'Failed to load product requests. Please try again.';
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
      await axios.put(
        `/api/products/${productId}/approve`,
        {
          vendorApproved: action === 'approve',
          status: action === 'approve' ? 'active' : 'rejected',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      toast.success(`Product ${action}d successfully`);
      fetchProductRequests();
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} product`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white">
        <Navbar_frame />
        <div className="max-w-7xl mx-auto p-6 mt-8">
          <div className="text-center py-10">
            <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p className="mt-2 text-gray-300">Loading product requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Navbar_frame />
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold text-white mb-6">Superadmin: Manage Product Requests</h1>

        {/* Status Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 mr-2">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="pending-approval">Pending Approval</option>
            <option value="active">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Product Requests Table */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
          {products.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No product requests found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {products.map(product => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 truncate max-w-xs" title={product.name}>
                        <a href={`/product/productsTemp/${product._id}`} className="text-indigo-400 hover:text-indigo-200">
                          {product.name}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 truncate max-w-xs" title={product.vendor?.vendorRequest?.businessInfo?.businessName || product.vendor?.name || 'N/A'}>
                        {product.vendor?.vendorRequest?.businessInfo?.businessName || product.vendor?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'active'
                              ? 'bg-green-700 text-green-100'
                              : product.status === 'pending-approval'
                              ? 'bg-yellow-700 text-yellow-100'
                              : 'bg-red-700 text-red-100'
                          }`}
                          title={product.approvalDate ? `Approved on ${new Date(product.approvalDate).toLocaleDateString()}` : ''}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.status === 'active' ? (
                          <span className="text-green-400">Approved</span>
                        ) : product.status === 'rejected' ? (
                          <span className="text-red-400">Rejected</span>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(product._id, 'approve')}
                              className="text-green-400 hover:text-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(product._id, 'reject')}
                              className="text-red-400 hover:text-red-200"
                            >
                              Reject
                            </button>
                          </div>
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
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-200">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSuperAdminProductRequests;