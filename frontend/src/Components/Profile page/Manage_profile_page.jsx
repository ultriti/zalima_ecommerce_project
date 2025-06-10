import React, { useState, useEffect } from 'react';
import axios from 'axios';
import User_side_frame from '../common_comps/User_side_frame';
import '../../index.css';
import Navbar_frame from '../Common frames/Navbar_frame';
import { toast } from 'react-toastify';

const ManageProfile = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    phoneNumber: '',
  });

  // Fetch current user profile to prefill form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/profile`, {
          withCredentials: true,
        });
        const [first, last] = data.name?.split(' ') || ['', ''];
        setFormData({
          first_name: first,
          last_name: last,
          gender: data.gender || '', // Optional: if added in DB
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
      } catch (err) {
        console.log('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send PUT request to update user profile
      const updateData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender, // Optional: only if supported
      };

      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
        updateData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <div className="Navbar_div bg-white  shadow-md fixed top-0 z-50">
        <Navbar_frame />
      </div>

      <div className="user_order_page_main_frame flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-800 text-white fixed top-16 bottom-0 left-0 overflow-y-auto">
          <div className="p-4">
            <User_side_frame />
          </div>
        </aside>

        {/* Form */}
        <main className="ml-64 flex-1 overflow-y-auto pb-8 pl-8 pr-8 pt-4 mt-10 bg-gray-900 ">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transform transition duration-500 ease-in-out hover:scale-[1.01] hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-6 mt-6 text-center text-gray-800 dark:text-white">
              Manage Profile
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <div className="flex items-center gap-6">
                  {['male', 'female', 'others'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        className="accent-blue-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageProfile;
