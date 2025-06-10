import React, { useEffect, useState } from "react";
import axios from "axios";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

const ManageVendorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/requests?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRequests(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vendor requests. Please try again later.';
      console.error('Error fetching vendor requests:', err.response?.data || err.message);
      setError(errorMessage);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (userId, action, rejectionReason = "") => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/vendor/requests/${userId}`,
        { action, rejectionReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchRequests();
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${action} vendor request. Please try again.`;
      console.error(`Error ${action}ing vendor request:`, err.response?.data || err.message);
      setError(errorMessage);
    }
  };

  const handleApprove = (userId) => {
    handleProcessRequest(userId, "approve");
  };

  const handleReject = (userId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      handleProcessRequest(userId, "reject", reason);
    } else if (reason !== null) {
      alert("Rejection reason is required.");
    }
  };

  return (
    <div>
      <SuperAdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <SuperAdminTopbar />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Manage Vendor Requests</h1>
          <div className="mb-6">
            <label htmlFor="statusFilter" className="mr-2 font-semibold">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {loading ? (
            <p>Loading vendor requests...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">User ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Business Name</th>
                    <th className="py-2 px-4 border-b">Business Description</th>
                    <th className="py-2 px-4 border-b">Business Address</th>
                    <th className="py-2 px-4 border-b">Business Phone</th>
                    <th className="py-2 px-4 border-b">Tax Number</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        No vendor requests found.
                      </td>
                    </tr>
                  )}
                  {requests.map((req) => (
                    <tr key={req._id}>
                      <td className="py-2 px-4 border-b">{req._id}</td>
                      <td className="py-2 px-4 border-b">{req.name}</td>
                      <td className="py-2 px-4 border-b">{req.email}</td>
                      <td className="py-2 px-4 border-b">
                        {req.vendorRequest?.businessInfo?.businessName || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {req.vendorRequest?.businessInfo?.businessDescription || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {req.vendorRequest?.businessInfo?.businessAddress || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {req.vendorRequest?.businessInfo?.contactPhone || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {req.vendorRequest?.businessInfo?.taxId || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={
                            req.vendorRequest?.status === "approved"
                              ? "text-green-600 font-semibold"
                              : req.vendorRequest?.status === "rejected"
                              ? "text-red-600 font-semibold"
                              : "text-yellow-600 font-semibold"
                          }
                        >
                          {req.vendorRequest?.status || "pending"}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {req.vendorRequest?.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(req._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
      </div>
    </div>
  );
};

export default ManageVendorRequests;