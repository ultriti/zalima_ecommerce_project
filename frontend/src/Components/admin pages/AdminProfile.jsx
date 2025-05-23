import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    profileImage: { url: "" }
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setProfile(res.data);
    } catch {
      setMessage("Failed to load profile.");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    setMessage("");
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setIsEditing(false);
      fetchProfile();
      setMessage("Profile updated!");
    } catch {
      setMessage("Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async () => {
    setMessage("");
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setMessage("All password fields are required.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/change-password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setPasswords({ current: "", new: "", confirm: "" });
      setMessage("Password changed successfully!");
    } catch (err) {
      setMessage(
        err?.response?.data?.message || "Failed to change password."
      );
    }
  };

  const handleImageUpload = async (e) => {
    setMessage("");
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      fetchProfile();
      setMessage("Profile image updated!");
    } catch {
      setMessage("Failed to upload image.");
    }
  };

  return (
    <div>
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen bg-gray-50">
        <AdminTopbar username={profile.name || "Admin"} />
        <div className="flex flex-col items-center pt-10 px-4">
          <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Admin Profile</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <label htmlFor="profileImage" className="cursor-pointer">
                      <img
                        src={
                          profile.profileImage?.url ||
                          "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(profile.name || "Admin")
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-full border object-cover"
                      />
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <div className="text-xs text-gray-500 text-center mt-1">
                      Click to change
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{profile.name}</div>
                    <div className="text-gray-600">{profile.email}</div>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {profile.role === "admin" ? "Admin" : profile.role}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="font-semibold block mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mb-4">
                  <label className="font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex gap-3 mb-6">
                  {isEditing ? (
                    <>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleProfileUpdate}
                      >
                        Save Changes
                      </button>
                      <button
                        className="bg-gray-200 px-4 py-2 rounded"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                <hr className="my-6" />
                <div>
                  <h2 className="font-semibold mb-2">Change Password</h2>
                  <div className="mb-2">
                    <input
                      type="password"
                      name="current"
                      placeholder="Current Password"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      className="w-full border px-3 py-2 rounded mb-2"
                    />
                    <input
                      type="password"
                      name="new"
                      placeholder="New Password"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      className="w-full border px-3 py-2 rounded mb-2"
                    />
                    <input
                      type="password"
                      name="confirm"
                      placeholder="Confirm New Password"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={handlePasswordUpdate}
                  >
                    Save Changes
                  </button>
                </div>
                {message && (
                  <div className="mt-4 text-center text-blue-600">{message}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;