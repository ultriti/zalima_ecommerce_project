import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar_frame from '../../Common frames/Navbar_frame.jsx';

const ManageProductRequests = () => {
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

    if (!['admin', 'superadmin'].includes(userRole)) {
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
      <div className="min-h-screen bg-gray-100">
        <Navbar_frame />
        <div className="max-w-7xl mx-auto p-6 mt-8">
          <div className="text-center py-10">
            <p>Loading product requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_frame />
      <div className="max-w-7xl mx-auto p-6 mt-8">
        <h1 className="text-3xl font-bold mb-6">Manage Product Requests</h1>

        {/* Status Filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mr-2">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending-approval">Pending Approval</option>
            <option value="active">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Product Requests Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center">No product requests found</p>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        {product.status === 'active' ? (
                          <span className="text-green-600">Approved</span>
                        ) : product.status === 'rejected' ? (
                          <span className="text-red-600">Rejected</span>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(product._id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(product._id, 'reject')}
                              className="text-red-600 hover:text-red-900"
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
  );
};

export default ManageProductRequests;