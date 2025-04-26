import React, { useEffect, useState } from 'react';
import User_side_frame from '../common_comps/User_side_frame';
import axios from 'axios';
import Navbar_frame from '../Common frames/Navbar_frame';
import { toast } from 'react-toastify';

const MAX_ADDRESSES = 5;

const Address_page = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/users/profile`, {
          withCredentials: true,
        });
  
        const savedAddresses = res.data.shippingAddresses || [];
        const defaultIndex = res.data.defaultShippingIndex ?? savedAddresses.length - 1;
  
        setAddresses(savedAddresses);
        setCurrentIndex(defaultIndex);
        setFormData(savedAddresses[defaultIndex] || {
          address: '',
          city: '',
          postalCode: '',
          country: '',
        });
  
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
  
    fetchUser();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSelectChange = (e) => {
  //   const index = parseInt(e.target.value);
  //   setCurrentIndex(index);
  //   setFormData(addresses[index] || {
  //     address: '',
  //     city: '',
  //     postalCode: '',
  //     country: '',
  //   });
  // };
  const handleSelectChange = async (e) => {
    const index = parseInt(e.target.value);
    setCurrentIndex(index);
    setFormData(addresses[index] || {
      address: '',
      city: '',
      postalCode: '',
      country: '',
    });
  
    try {
      // Save selected index to backend
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/profile`,
        { defaultShippingIndex: index },
        { withCredentials: true }
      );
  
      if (res.status === 200) {
        setUser((prev) => ({
          ...prev,
          defaultShippingIndex: index,
        }));
      }
    } catch (error) {
      console.error("Failed to update default shipping index:", error);
    }
  };
  
  const isDuplicate = (newAddress) => {
    return addresses.some(addr =>
      addr.address === newAddress.address &&
      addr.city === newAddress.city &&
      addr.postalCode === newAddress.postalCode &&
      addr.country === newAddress.country
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isDuplicate(formData)) {
      toast.warning('This address already exists!');
      return;
    }
  
    const updatedAddresses = [...addresses];
    updatedAddresses[currentIndex] = formData;
  
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
        {
          shippingAddresses: updatedAddresses,
          defaultShippingIndex: currentIndex,
        },
        { withCredentials: true }
      );
  
      if (res.status === 200) {
        toast.success('Address saved successfully!');
        setAddresses(updatedAddresses);
        setUser((prev) => ({
          ...prev,
          shippingAddresses: updatedAddresses,
          defaultShippingIndex: currentIndex,
        }));
      }
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error('Failed to save address.');
    }
  };
  
  const handleAddNewAddress = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      alert(`You can only save up to ${MAX_ADDRESSES} addresses.`);
      return;
    }

    const newAddress = {
      address: '',
      city: '',
      postalCode: '',
      country: '',
    };

    const updatedAddresses = [...addresses, newAddress];

    setAddresses(updatedAddresses);
    setCurrentIndex(updatedAddresses.length - 1);
    setFormData(newAddress);
  };

  const handleDelete = async (indexToDelete) => {
    const confirmed = window.confirm('Are you sure you want to delete this address?');
    if (!confirmed) return;

    const updatedAddresses = addresses.filter((_, idx) => idx !== indexToDelete);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/profile`,
        { shippingAddresses: updatedAddresses },
        { withCredentials: true }
      );

      if (res.status === 200) {
        alert('Address deleted successfully!');
        setAddresses(updatedAddresses);

        const newIndex = Math.max(0, updatedAddresses.length - 1);
        setCurrentIndex(newIndex);
        setFormData(updatedAddresses[newIndex] || {
          address: '',
          city: '',
          postalCode: '',
          country: '',
        });
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-white flex flex-col">
      <div className="Navbar_div bg-white shadow-md sticky top-0 z-50">
        <Navbar_frame />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-blue-800 text-white fixed top-16 bottom-0 left-0 overflow-y-auto">
          <div className="p-4">
            <User_side_frame />
          </div>
        </aside>

        <main className="ml-64 flex-1 overflow-y-auto pb-8 pl-8 pr-8 pt-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
              Manage Shipping Addresses
            </h2>

            {addresses.length > 0 && (
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 dark:text-white">
                  Select Current Address
                </label>
                <select
                  value={currentIndex}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {addresses.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Address {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Display all addresses */}
            <div className="grid gap-4 mb-6">
              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-md shadow-md transition ${
                    idx === currentIndex
                      ? 'bg-green-100 dark:bg-green-700'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800 dark:text-white">Address {idx + 1}</p>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(idx)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{addr.address}</p>
                  <p className="text-gray-700 dark:text-gray-300">{addr.city}</p>
                  <p className="text-gray-700 dark:text-gray-300">{addr.postalCode}</p>
                  <p className="text-gray-700 dark:text-gray-300">{addr.country}</p>
                </div>
              ))}
            </div>

            {/* Address form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={handleAddNewAddress}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  Add New Address
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Address_page;
