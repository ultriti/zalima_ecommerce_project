import React, { useEffect, useState } from 'react';
import axios from 'axios';
import User_side_frame from '../common_comps/User_side_frame';
import '../../index.css';
import Navbar_frame from '../Common frames/Navbar_frame';

const Order_page = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/users/orders', { withCredentials: true });
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Something went wrong');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <div className="Navbar_div bg-white shadow-md fixed left-0 top-0 z-50">
        <Navbar_frame />
      </div>

      <div className="user_order_page_main_frame flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-800 text-white fixed top-16 bottom-0 left-0 overflow-y-auto">
          <div className="p-4">
            <User_side_frame />
          </div>
        </aside>

        {/* Orders Section */}
        <main className="ml-64 flex-1 overflow-y-auto pb-8 pl-8 pr-8 mt-15 pt-4 bg-gray-900 ">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transform transition duration-500 ease-in-out hover:scale-[1.01] hover:shadow-lg">
            <h2 className="text-2xl font-bold mb-6 mt-6 text-center text-gray-800 dark:text-white">
              Your Orders
            </h2>

            {loading ? (
              <p className="text-blue-400 dark:text-blue-300 animate-pulse text-center">Loading your orders...</p>
            ) : error ? (
              <p className="text-red-500 font-semibold text-center">{error}</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic text-center">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-md rounded-xl p-6"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        Order #{order._id.slice(-6)}
                      </h2>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full 
                        ${order.status === 'Delivered' ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100'
                          : order.status === 'Shipped' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100'
                            : order.status === 'Cancelled' ? 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-100'
                              : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <p>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p>Total: {order.totalPrice.toFixed(2)}</p>
                      <p>
                        Payment:{' '}
                        {order.isPaid
                          ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}`
                          : 'Not Paid'}
                      </p>
                      <p>
                        Delivery:{' '}
                        {order.isDelivered
                          ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`
                          : 'Not Delivered'}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Items:</p>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                        {order.orderItems.map((item, index) => (
                          <li key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                              <span className="text-gray-800 dark:text-gray-200">
                                {item.name} × {item.qty}
                              </span>
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {item.price}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Order_page;
