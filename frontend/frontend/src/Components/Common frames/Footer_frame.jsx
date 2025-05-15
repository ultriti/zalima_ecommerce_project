import React from 'react';

const Footer_frame = () => {
  return (
    <footer className="bg-white h-[100vh] w-[100%] text-black py-18 px-10 md:py-8 ms:px-2">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 shadow-[ 0 0 10px grey]">
        {/* Contact Section */}
        <div>
          <h3 className="font-bold text-xl mb-4">Contact Us</h3>
          <p>Demo Store</p>
          <p>42 Puffin Street 12345</p>
          <p>Puffinville</p>
        </div>

        {/* Products Section */}
        <div>
          <h3 className="font-bold text-xl mb-4">Products</h3>
          <ul>
            <li>Prices Drop</li>
            <li>New Products</li>
            <li>Best Sales</li>
          </ul>
        </div>

        {/* Our Company Section */}
        <div>
          <h3 className="font-bold text-xl mb-4">Our Company</h3>
          <ul>
            <li>Delivery</li>
            <li>Legal Notice</li>
            <li>Terms & Conditions</li>
            <li>About Us</li>
            <li>Secure Payment</li>
          </ul>
        </div>

        {/* Trending Categories Section */}
        <div>
          <h3 className="font-bold text-xl mb-4">Trending Categories</h3>
          <ul>
            <li>Camera Accessories</li>
            <li>Gaming & Accessories</li>
            <li>Headphones & Cushions</li>
            <li>Home Theatres</li>
            <li>Microwave Ovens</li>
          </ul>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-4 mt-8">
        <h3 className="font-bold text-lg mb-4 text-center">Join Our Newsletter, Get 10% Off</h3>
        <form className="flex justify-center">
          <input
            type="email"
            placeholder="Your email address"
            className="p-2 border border-gray-300 rounded-l-md w-full max-w-xs"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r-md"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Bottom Cookie Notice */}
      <div className="bg-white text-red-400 text-center py-4 mt-8">
        <p>
          This is a standard cookie notice. Click <span className="text-blue-400">Accept</span> to continue using the site.
        </p>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Accept
        </button>
      </div>
    </footer>
  );
};

export default Footer_frame;
