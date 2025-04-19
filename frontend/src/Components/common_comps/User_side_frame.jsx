import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logout_svg from '../../../public/images/logout.svg';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const User_side_frame = () => {
  const location = useLocation();

  useGSAP(() => {
    gsap.from('.user-navigate-link', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, [location.pathname]);

  const links = [
    { to: '/user/profile', label: 'Profile' },
    { to: '/user/manage_profile', label: 'Manage Profile' },
    { to: '/user/address_', label: 'My Address' },
    { to: '/user/orders', label: 'Orders' },
    { to: '/user/logout', label: 'Logout', icon: logout_svg, isLogout: true },
  ];
  
  return (
    <div className="h-[calc(100vh-64px)] w-full md:w-64 bg-[#1d4194] text-white p-4 shadow-lg rounded-none md:rounded-r-xl fixed top-[64px] left-0 z-10">
      <ul className="space-y-2 mt-6">
        {links.map((link, index) => {
          const isActive = location.pathname === link.to;
          return (
            <li key={index}>
              <Link to={link.to}>
                <div
                  className={`user-navigate-link flex items-center gap-2 px-4 py-3 rounded-md transition-colors duration-200
                  ${isActive ? 'bg-[#132b63]' : 'hover:bg-[#132b63]'} 
                  ${link.isLogout ? 'mt-4 text-red-200 hover:text-white' : ''}`}
                >
                  {link.icon && (
                    <img src={link.icon} alt="icon" className="w-5 h-5" />
                  )}
                  {link.label}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default User_side_frame;
