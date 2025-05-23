import React from 'react';
import './Home_page.css';
import Navbar_frame from '../Common_frames/Navbar_frame';
import HomePage_1 from './HomePage_1';
import Home_page_2 from './Home_page_2';
import Footer_frame from '../Common_frames/Footer_frame';
import Offers_frame from '../Common_frames/Offers_frame';

const Home_page = () => {
  return (
    <div className="home_page_frame bg-gray-100">
      <div className="home_page_cont w-full">
        {/* Navbar */}
        <div className="Navbar_frame fixed top-0 left-0 z-50 w-full">
          <Navbar_frame />
        </div>

        {/* Main Content */}
        <div className="Home_page_main_frame pt-16">
          {/* Hero Section */}
          <div className="w-full h-[50vh] md:h-[90vh]">
            <HomePage_1 />
          </div>

          {/* Offers Section */}
          <div className="home_page_offers_frame h-[20vh] mt-10 md:mt-20 md:h-[30vh] flex flex-col justify-center items-center">
            <Offers_frame />
          </div>

          {/* Product Categories */}
          <div className="w-full min-h-[100vh] py-8">
            <Home_page_2 />
          </div>
        </div>

        {/* Footer */}
        <div className="footer_frame">
          <Footer_frame />
        </div>
      </div>
    </div>
  );
};

export default Home_page;