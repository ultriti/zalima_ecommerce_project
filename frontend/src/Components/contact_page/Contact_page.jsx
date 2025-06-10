import React from 'react';
import Navbar_frame from '../Common frames/Navbar_frame';
import User_side_frame from "../common_comps/User_side_frame";
import "../Profile page/Order_page.css"

const Contact_page = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <div className="Navbar_div bg-white  shadow-md fixed top-0 z-50">
        <Navbar_frame />
      </div>

      <div className="user_order_page_main_frame flex flex-col lg:flex-row">
        {/* -------------> user side bar */}
        <aside className="w-64 bg-blue-800 text-white fixed top-16 bottom-0 left-0 overflow-y-auto ">
          <div className="p-4">
            <User_side_frame />
          </div>
        </aside>

        {/* Main Content */}
        <div className="ml-64 flex-1 pb-8 pl-8 pr-8 pt-4 bg-gray-900 overflow-y-auto mt-15">
          <div className="container h-[80vh] mx-auto flex flex-wrap md:flex-nowrap bg-gray-800 shadow-lg rounded-[20px] transform transition duration-500 ease-in-out hover:scale-[1.01] hover:shadow-lg">

            {/* Left Section */}
            <div className="w-full md:w-1/2 p-6 text-gray-100">
              <h1 className="text-3xl font-bold mb-4">Contact us</h1>
              <p className="text-sm text-gray-400 mb-6">
                Need to get in touch with us? Either fill out the form with your inquiry or find the department email you'd like to contact below.
              </p>
            </div>

            {/* Right Section (Form) */}
            <div className="w-full md:w-1/2 p-6">
              <form className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-100">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white capitalize"
                    placeholder='First Name'
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-100">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white capitalize"
                    placeholder='Last Name'
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-100">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white capitalize"
                    placeholder='email'
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-100">
                    What can we help you with?
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white capitalize"
                    placeholder='Comment your text here ....'
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 cursor-pointer text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact_page;
