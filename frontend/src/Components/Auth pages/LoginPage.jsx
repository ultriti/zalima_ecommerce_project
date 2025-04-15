import React from "react";
import "./Login_page.css"
import "../Common routes/Navbar_frame.css"
import Navbar_frame from "../Common frames/Navbar_frame";

import bg_img from "../../../public/images/register_page_bgc.svg"

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center flex-col  min-h-screen bg-blue-100   md:flex-xol ">

      <div className="Navbar_frame felx justify-between fixed top-0 left-0 right-0 z-10 ">
        <Navbar_frame/>
      </div>

      <div className="flex h-full flex-col mt-[4vw] md:flex-row overflow-hidden bg-blue-100 rounded-[2vw] shadow-[0px_4px_10px_rgba(0,0,0,0.25)]">
        <div className=" w-150 h-150 rounded-l-[2vw] shadow-md">
          <img src={bg_img} alt="" className="width-full h-full object-cover rounded-l-[2vw]" />
        </div>
        <div className="w-150 h-150 max-w-md p-8 space-y-6 items-center flex flex-col  rounded-r-[2vw] shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
          <form className="space-y-4 h-150 w-full  flex items-center justify-center flex-col">
            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input_inputs w-full px-4 py-2 1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 mt-5 text-white cursor-pointer bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
