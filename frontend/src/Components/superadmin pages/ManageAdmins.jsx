import React, { useEffect, useState } from "react";
import axios from "axios";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changeRoleAdmin, setChangeRoleAdmin] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [roleError, setRoleError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users?role=admin`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setAdmins(response.data);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (adminId) => {
    setActionLoading(true);
    setRoleError("");
    try {
      if (!newRole || !secretKey) {
        setRoleError("Role and secret key required.");
        setActionLoading(false);
        return;
      }
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${adminId}/promote`,
        { role: newRole, secretKey },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setChangeRoleAdmin(null);
      setNewRole("");
      setSecretKey("");
      fetchAdmins();
    } catch (err) {
      setRoleError(
        err?.response?.data?.message || "Role change failed. Secret key required."
      );
    }
    setActionLoading(false);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setDeleteLoadingId(adminId);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}/api/users/${adminId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchAdmins();
    } catch {
      alert("Failed to delete admin.");
    }
    setDeleteLoadingId(null);
  };

  return (
    <div>
      <SuperAdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <SuperAdminTopbar />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Manage Admins</h1>
          {loading ? <p>Loading admins...</p> : (
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Admin ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Role</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <React.Fragment key={admin._id}>
                      <tr>
                        <td className="py-2 px-4 border-b">{admin._id}</td>
                        <td className="py-2 px-4 border-b">{admin.name}</td>
                        <td className="py-2 px-4 border-b">{admin.email}</td>
                        <td className="py-2 px-4 border-b">{admin.role}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
                            onClick={() => {
                              setChangeRoleAdmin(admin._id);
                              setNewRole("");
                              setSecretKey("");
                              setRoleError("");
                            }}
                          >
                            Change Role
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleDelete(admin._id)}
                            disabled={deleteLoadingId === admin._id}
                          >
                            {deleteLoadingId === admin._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                      {changeRoleAdmin === admin._id && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50 px-4 py-4 border-b">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="border px-2 py-1 rounded"
                              >
                                <option value="">Select Role</option>
                                <option value="user">User</option>
                                <option value="vendor">Vendor</option>
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
                                onClick={() => handlePromote(admin._id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? "Changing..." : "Confirm"}
                              </button>
                              <button
                                className="ml-2 text-gray-600 underline"
                                onClick={() => setChangeRoleAdmin(null)}
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

export default ManageAdmins;