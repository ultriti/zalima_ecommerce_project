import React from 'react';
import User_side_frame from '../common_comps/User_side_frame';
import User_info_display from './user_info_display';
import '../../index.css';
import Navbar_frame from '../Common frames/Navbar_frame';
import { Link, useNavigate } from 'react-router-dom';

const Profile_page = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Navbar */}
      <header className="bg-white  shadow-md sticky top-0 z-50">
        <Navbar_frame />
      </header>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 ">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-800 text-white fixed top-16 bottom-0 left-0 overflow-y-auto ">
          <div className="p-4">
            <User_side_frame />
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 pb-8 pl-8 pr-8 pt-4 bg-gray-900">
          {/* User Info Display */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transform transition duration-500 ease-in-out hover:scale-[1.01] hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Profile Overview
            </h2>
            <User_info_display />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile_page;
