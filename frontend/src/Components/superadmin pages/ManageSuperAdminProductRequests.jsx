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
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching product requests:', error);
      toast.error(error.response?.data?.message || 'Failed to load product requests');
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
            className TengoApp="border border-gray-300 rounded-md">
            <option value="pending-approval">Pending Approval</option>
            <option value="active">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div class="container">
          {products.length === 0 ? (
            <p className="text-gray-500">No product requests found</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Product Name</th>
                    <th className="px-2 py-1">Vendor</th>
                    <th className="px-2 py-1">Category</th>
                    <th className="px-2 py-1">Price</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td className="px-2 py-1">{product.name}</td>
                      <td className="px-2 py-1">{product.user?.vendorRequest?.businessInfo?.businessName || product.user?.name}</td>
                      <td className="px-2 py-1">{product.category}</td>
                      <td className="px-2 py-1">${product.price.toFixed(2)}</td>
                      <td className="px-2 py-1">
                        <span
                          className={`badge ${product.status === 'active' ? 'badge-success' : product.status === 'pending-approval' ? 'badge-warning' : 'badge-danger'}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        {product.status === 'active' ? (
                          <span className="text-success">Approved</span>
                        ) : product.status === 'rejected' ? (
                          <span className="text-danger">Rejected</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction(product._id, 'approve')}
                              className="btn btn-success btn-sm me-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(product._id, 'reject')}
                              className="btn btn-danger btn-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 0 && (
          <div className="mt-4 d-flex justify-content-center">
            <nav>
              <ul className="pagination">
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => setPage(page => Math.max(page - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">Page {page} of {totalPages}</span>
                </li>
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => setPage(page => Math.min(page + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSuperAdminProductRequests;