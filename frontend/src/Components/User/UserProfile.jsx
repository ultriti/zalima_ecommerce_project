import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar_frame from '../Common frames/Navbar_frame';
import User_side_frame from '../common_comps/User_side_frame';

const addressLabels = ['Home', 'Office', 'Friend', 'Other'];
const departments = ['Men', 'Women', 'Kids', 'Unisex'];
const fitAttributes = ['Slim', 'Regular', 'Loose', 'Athletic'];
const interestsList = [
  'Streetwear', 'Formal', 'Sportswear', 'Accessories', 'Sneakers', 'Ethnic', 'Casual', 'Vintage', 'Eco-friendly', 'Designer'
];

// List of country codes
const countryCodes = [
  { code: '+1', country: 'United States' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  // Add more country codes as needed
];

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    address: '', city: '', postalCode: '', country: '', label: 'Home',
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Profile edit states
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profileImage: '',
    countryCode: '+1' // Default country code
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Preferences
  const [preferredDept, setPreferredDept] = useState('');
  const [size, setSize] = useState('');
  const [fit, setFit] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Collapsible sections
  const [openSection, setOpenSection] = useState('');

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!loggedInUserId || loggedInUserId !== id) {
      setError('You are not authorized to view this profile.');
      setUser(undefined);
      return;
    }

    if (!token) {
      setError('No authentication token found. Please log in again.');
      setUser(undefined);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        // Update localStorage role to ensure consistency
        localStorage.setItem('userRole', res.data.role);
        setAddresses(res.data.shippingAddresses || []);
        // Extract country code if phoneNumber includes it
        let phone = res.data.phoneNumber || '';
        let selectedCode = '+1'; // Default
        for (const { code } of countryCodes) {
          if (phone.startsWith(code)) {
            selectedCode = code;
            phone = phone.slice(code.length);
            break;
          }
        }
        setProfileData({
          name: res.data.name || '',
          email: res.data.email || '',
          phoneNumber: phone,
          profileImage: res.data.profileImage?.url || '',
          countryCode: selectedCode,
        });
        setPreviewImg(res.data.profileImage?.url || '');
        setPreferredDept(res.data.preferredDept || '');
        setSize(res.data.size || '');
        setFit(res.data.fit || '');
        setAgeGroup(res.data.ageGroup || '');
        setSelectedInterests(res.data.interests || []);
        setError('');
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(undefined);
        setError(
          err.response?.data?.message ||
          'Failed to load profile. Please log in again.'
        );
      }
    };

    fetchUser();
  }, [id]);

  // Address handlers
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const updatedAddresses = [...addresses];
    if (editingIndex !== null) {
      updatedAddresses[editingIndex] = newAddress;
    } else {
      updatedAddresses.push(newAddress);
    }
    try {
      const token = localStorage.getItem('token');
      console.log('Sending PUT request to:', `${import.meta.env.VITE_BASE_URI}/api/users/${id}`);
      console.log('Payload:', { shippingAddresses: updatedAddresses });
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${id}`,
        { shippingAddresses: updatedAddresses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(updatedAddresses);
      setNewAddress({ address: '', city: '', postalCode: '', country: '', label: 'Home' });
      setEditingIndex(null);
      setOpenSection('');
    } catch (err) {
      console.error('Address update error:', err.response?.data);
      alert(`Failed to update addresses: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleEditAddress = (idx) => {
    setNewAddress(addresses[idx]);
    setEditingIndex(idx);
    setOpenSection('addresses'); // Open the addresses section
  };

  const handleDeleteAddress = async (idx) => {
    const updatedAddresses = addresses.filter((_, i) => i !== idx);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${id}`,
        { shippingAddresses: updatedAddresses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(updatedAddresses);
    } catch (err) {
      alert('Failed to delete address.');
    }
  };

  // Profile edit handlers
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Please log in again.');
      return;
    }
    let updatedProfileImageUrl = previewImg;

    try {
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);

        const imgRes = await axios.put(
          `${import.meta.env.VITE_BASE_URI}/api/users/upload-profile-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // Let browser set Content-Type for multipart/form-data
            },
          }
        );
        updatedProfileImageUrl = imgRes.data.profileImage.url;
      }

      // Combine country code with phone number
      const fullPhoneNumber = `${profileData.countryCode}${profileData.phoneNumber}`;

      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${id}`,
        {
          name: profileData.name,
          email: profileData.email,
          phoneNumber: fullPhoneNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser({
        ...user,
        name: profileData.name,
        email: profileData.email,
        phoneNumber: fullPhoneNumber,
        profileImage: { url: updatedProfileImageUrl },
      });
      setPreviewImg(updatedProfileImageUrl);
      setEditMode(false);
      setProfileImageFile(null);
      setOpenSection('');
    } catch (err) {
      console.error('Profile update error:', err.response?.data);
      alert(`Failed to update profile: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${id}/password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOpenSection(''); // Close the section after saving
    } catch (err) {
      alert('Failed to update password. Please check your current password.');
    }
  };

  // Preferences handlers
  const handlePreferencesSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/${id}`,
        { preferredDept, size, fit, ageGroup, interests: selectedInterests },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, preferredDept, size, fit, ageGroup, interests: selectedInterests });
      alert('Preferences saved!');
      setOpenSection(''); // Close the section after saving
    } catch (err) {
      alert('Failed to save preferences.');
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // Log out handler
  const handleLogout = () => {
    navigate('/user/logout');
  };

  if (error || user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error || 'An error occurred while loading the profile.'}</p>
          <Link to="/user/signin" className="text-blue-600 underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-900 py-8 px-4">
      {/* Navbar */}
      <div className="Navbar_div bg-white shadow-md fixed left-0 top-0 z-50">
        <Navbar_frame />
      </div>

       <aside className="w-64 bg-blue-800 text-white fixed top-16 bottom-0 left-0 overflow-y-auto">
          <div className="p-4">
            <User_side_frame />
          </div>
        </aside>


      <div className="max-w-3xl mx-auto mt-20 rounded-2xl shadow-xl p-6 bg-gray-800">
        {/* Header Section */}
        <div className="relative flex items-center justify-between mb-8 flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-200 hover:text-gray-400 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-gray-300 text-center">My Profile</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleSection('editProfile')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-300 font-medium hover:bg-gray-100 hover:border-gray-500 hover:text-gray-900 transition-all duration-200"
            >
              {openSection === 'editProfile' ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-[8.5rem] mx-auto">
            <img
              src={previewImg || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
            />
            {openSection === 'editProfile' && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-gray-300 text-center">{user.name}</h3>
          <p className="text-gray-600 text-center">{user.email}</p>
          <p className="text-gray-600 text-center">{user.phoneNumber}</p>
        </div>

        {/* Edit Profile Section */}
        {openSection === 'editProfile' && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <div className="flex space-x-2">
                <select
                  name="countryCode"
                  value={profileData.countryCode}
                  onChange={handleProfileChange}
                  className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {countryCodes.map(({ code, country }) => (
                    <option key={code} value={code}>
                      {code} ({country})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="Phone Number"
                  className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleProfileSave}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('password')}
            className="w-full flex justify-between items-center p-4 bg-gray-400 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${openSection === 'password' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>


          {openSection === 'password' && (
            <div className="mt-2 p-4 bg-gray-500  rounded-lg shadow-inner animate-fade-in">
              <div className="space-y-4">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  onClick={handlePasswordSave}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shipping Addresses Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('addresses')}
            className="w-full flex justify-between items-center p-4 bg-gray-400 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">Shipping Addresses</h3>
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${openSection === 'addresses' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>


          {openSection === 'addresses' && (
            <div className="mt-2 p-4 bg-gray-500 rounded-lg shadow-inner animate-fade-in">
              {addresses.map((addr, idx) => (
                <div key={idx} className="border p-4 mb-2 rounded-lg bg-gray-400 shadow-sm">
                  <p className="font-semibold">{addr.label}</p>
                  <p className="text-gray-600">{addr.address}, {addr.city}, {addr.postalCode}, {addr.country}</p>
                  <div className="mt-2 flex space-x-3">
                    <button
                      onClick={() => handleEditAddress(idx)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
                <select
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {addressLabels.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="Address"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <input
                  type="text"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  placeholder="Postal Code"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <input
                  type="text"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  placeholder="Country"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  {editingIndex !== null ? 'Update Address' : 'Add Address'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('preferences')}
            className="w-full flex justify-between items-center p-4 bg-gray-400 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${openSection === 'preferences' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>


          {openSection === 'preferences' && (
            <div className="mt-2 p-4 bg-gray-500 rounded-lg shadow-inner animate-fade-in">
              <div className="space-y-4">
                <select
                  value={preferredDept}
                  onChange={(e) => setPreferredDept(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Size (e.g., M, L, XL)"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Fit</option>
                  {fitAttributes.map((fitOption) => (
                    <option key={fitOption} value={fitOption}>{fitOption}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  placeholder="Age Group (e.g., 20-30)"
                  className="w-full px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {interestsList.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full border transition-all duration-200 ${selectedInterests.includes(interest)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handlePreferencesSave}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Section (Vendor Action, Log Out) */}
        <div className="mt-6 p-4 bg-gray-400 rounded-lg shadow-inner hover:bg-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {user.role === 'vendor' ? (
              <button
                onClick={() => navigate('/vendor/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-300 font-medium hover:bg-gray-200 hover:border-gray-500 hover:text-gray-900 transition-all duration-200"
              >
                Vendor Dashboard
              </button>
            ) : user.role === 'admin' ? (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 border bg-gray-400 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-500 hover:text-gray-900 transition-all duration-200"
              >
                Admin Dashboard
              </button>
            ) : user.role === 'superadmin' ? (
              <button
                onClick={() => navigate('/superadmin/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-500 hover:text-gray-900 transition-all duration-200"
              >
                Superadmin Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/user/become-vendor')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-500 hover:text-gray-900 transition-all duration-200"
              >
                Become a Vendor
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg text-red-600 font-medium hover:bg-gray-100 hover:border-red-500 hover:text-red-800 transition-all duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default UserProfile;