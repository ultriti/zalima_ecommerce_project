import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const User_info_display = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userImage, setUserImage] = useState('');       // Actual uploaded image
  const [imagePreview, setImagePreview] = useState(''); // Temporary preview image
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const get_user_details = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/users/profile`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUserData(res.data);
        setUserImage(res.data.image || '');
        setImagePreview(''); // Clear any previous preview
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_user_details();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Preview immediately
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('profileImage', imageFile);

    setUploading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/upload-profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (res.data && res.data.image) {
        setUserImage(res.data.image);  // Set actual uploaded image
        setImagePreview('');           // Clear preview
        setImageFile(null);            // Clear file input
      }

      const updatedRes = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/users/profile`, {
        withCredentials: true,
      });

      if (updatedRes.status === 200) {
        setUserData(updatedRes.data);
        setUserImage(updatedRes.data.image || '');
      }

      toast.success('Profile image uploaded!');
    } catch (err) {
      console.error('Error uploading profile image:', err);
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const currentAddress =
    Array.isArray(userData.shippingAddresses) &&
    userData.shippingAddresses[userData.defaultShippingIndex ?? 0];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="user_display_info_frame bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 w-full max-w-xl text-center">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        ) : (
          <>
            {/* Avatar Upload Section */}
            <div className="relative mb-5 flex flex-col items-center">
              <img
                src={
                  imagePreview
                    ? imagePreview // Show selected preview if available
                    : userImage
                      ? `${userImage}?t=${Date.now()}` // Add timestamp to prevent caching
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=0D8ABC&color=fff`
                }
                className="w-24 h-24 rounded-full shadow-md border-4 border-blue-500 object-cover transition-all duration-300 ease-in-out"
                alt="User Avatar"
              />

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                id="profile-image-upload"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Trigger File Picker */}
              <label
                htmlFor="profile-image-upload"
                className="mt-3 inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Change Image
              </label>

              {/* Upload Button */}
              {imageFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`mt-2 px-4 py-2 ${
                    uploading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-md text-sm transition`}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {userData.name || 'Unnamed User'}
            </h1>

            {/* User Info */}
            <div className="text-left space-y-3">
              {['email', 'role', 'phoneNumber', 'isVerified'].map((key) => {
                const value = userData[key];
                if (value === undefined || value === null || value === '') return null;
                return (
                  <p key={key} className="text-gray-700 dark:text-gray-300 text-sm">
                    <span className="font-semibold">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </span>{' '}
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                  </p>
                );
              })}
              {currentAddress && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Current Shipping Address
                  </h3>
                  <ul className="ml-4 list-disc text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {Object.entries(currentAddress).map(([subKey, subVal]) =>
                      subKey !== '_id' && subVal ? (
                        <li key={subKey}>
                          <span className="font-medium">{subKey}:</span> {subVal}
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default User_info_display;
