import React, { useEffect, useState } from "react";
import axios from "axios";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changeRoleVendor, setChangeRoleVendor] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [roleError, setRoleError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users?role=vendor`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setVendors(response.data);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (vendorId) => {
    setActionLoading(true);
    setRoleError("");
    try {
      if (!newRole || !secretKey) {
        setRoleError("Role and secret key required.");
        setActionLoading(false);
        return;
      }
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${vendorId}/promote`,
        { role: newRole, secretKey },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setChangeRoleVendor(null);
      setNewRole("");
      setSecretKey("");
      fetchVendors();
    } catch (err) {
      setRoleError(
        err?.response?.data?.message || "Role change failed. Secret key required."
      );
    }
    setActionLoading(false);
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    setDeleteLoadingId(vendorId);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}/api/users/${vendorId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchVendors();
    } catch {
      alert("Failed to delete vendor.");
    }
    setDeleteLoadingId(null);
  };

  return (
    <div>
      <SuperAdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <SuperAdminTopbar />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Manage Vendors</h1>
          {loading ? <p>Loading vendors...</p> : (
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Vendor ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Business</th>
                    <th className="py-2 px-4 border-b">Role</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <React.Fragment key={vendor._id}>
                      <tr>
                        <td className="py-2 px-4 border-b">{vendor._id}</td>
                        <td className="py-2 px-4 border-b">{vendor.name}</td>
                        <td className="py-2 px-4 border-b">{vendor.email}</td>
                        <td className="py-2 px-4 border-b">{vendor.vendorRequest?.businessInfo?.businessName || "N/A"}</td>
                        <td className="py-2 px-4 border-b">{vendor.role}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
                            onClick={() => {
                              setChangeRoleVendor(vendor._id);
                              setNewRole("");
                              setSecretKey("");
                              setRoleError("");
                            }}
                          >
                            Change Role
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleDelete(vendor._id)}
                            disabled={deleteLoadingId === vendor._id}
                          >
                            {deleteLoadingId === vendor._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                      {changeRoleVendor === vendor._id && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50 px-4 py-4 border-b">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="border px-2 py-1 rounded"
                              >
                                <option value="">Select Role</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <input
                                type="password"
                                placeholder="Secret Key"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="border px-2 py-1 rounded"
                              />
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                                onClick={() => handlePromote(vendor._id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? "Changing..." : "Confirm"}
                              </button>
                              <button
                                className="ml-2 text-gray-600 underline"
                                onClick={() => setChangeRoleVendor(null)}
                                disabled={actionLoading}
                              >
                                Cancel
                              </button>
                              {roleError && (
                                <span className="ml-4 text-red-500 text-sm">{roleError}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

export default ManageVendors;