import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import "../Common routes/Navbar_frame.css";
import user_profile_pic from '../../../public/images/profile_pic.svg';
import logo from "../../../public/images/logo.svg"


const Navbar_frame = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const baseLink = "block py-2 px-3 rounded-sm md:p-0 md:border-0";
  const activeLink = "text-white bg-white md:text-black md:bg-transparent";
  const inactiveLink = "text-white hover:text-blue-900";

  return (
    <nav className="bg-white border-gray-200 dark:bg-blue-500">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8" alt="trendify Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Trendify</span>
        </a>

        {/* Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-100 
          focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`w-full md:block md:w-auto ${isMobileMenuOpen ? '' : 'hidden'}`}
          id="navbar-default"
        >
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg 
            bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white 
            dark:bg-blue-500 md:dark:bg-blue-500 dark:border-gray-700">
            
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? activeLink : inactiveLink}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/about"
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? activeLink : inactiveLink}`
                }
              >
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/register"
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? activeLink : inactiveLink}`
                }
              >
                Signup
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/profile"
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? activeLink : inactiveLink}`
                }
              >
                <img src={user_profile_pic} alt="Profile" className="h-6 w-6 rounded-full" />
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar_frame;
