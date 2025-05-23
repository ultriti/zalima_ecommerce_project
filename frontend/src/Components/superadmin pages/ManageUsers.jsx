import React, { useEffect, useState } from "react";
import axios from "axios";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";
import { useNavigate, Link } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changeRoleUser, setChangeRoleUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [roleError, setRoleError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setUsers(response.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId) => {
    setActionLoading(true);
    setRoleError("");
    try {
      if (!newRole || !secretKey) {
        setRoleError("Role and secret key required.");
        setActionLoading(false);
        return;
      }
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${userId}/promote`,
        { role: newRole, secretKey },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setChangeRoleUser(null);
      setNewRole("");
      setSecretKey("");
      fetchUsers();
    } catch (err) {
      setRoleError(
        err?.response?.data?.message || "Promotion failed. Secret key required."
      );
    }
    setActionLoading(false);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeleteLoadingId(userId);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchUsers();
    } catch {
      alert("Failed to delete user.");
    }
    setDeleteLoadingId(null);
  };

  return (
    <div>
      <SuperAdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <SuperAdminTopbar />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Users</h1>
            <Link
              to="/superadmin/managevendorrequests"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              Manage Vendor Requests
            </Link>
          </div>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">User ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Role</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr>
                        <td className="py-2 px-4 border-b">{user._id}</td>
                        <td className="py-2 px-4 border-b">{user.name}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.role}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
                            onClick={() => {
                              setChangeRoleUser(user._id);
                              setNewRole("");
                              setSecretKey("");
                              setRoleError("");
                            }}
                          >
                            Change Role
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleDelete(user._id)}
                            disabled={deleteLoadingId === user._id}
                          >
                            {deleteLoadingId === user._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                      {changeRoleUser === user._id && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50 px-4 py-4 border-b">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="border px-2 py-1 rounded"
                              >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
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
                                onClick={() => handlePromote(user._id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? "Promoting..." : "Confirm"}
                              </button>
                              <button
                                className="ml-2 text-gray-600 underline"
                                onClick={() => setChangeRoleUser(null)}
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

export default ManageUsers;