import React from 'react'
import "./App.css"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Register_pages from './Components/Auth pages/Register_pages'
import Home_page from './Components/Home page/Home_page'
import PageNotFound from './Components/Common frames/PageNotFound'
import AllProduct from './Components/Product_pages/AllProduct'
import Product_details_template from './Components/Product_pages/Product_details_template'
import About from './Components/About page/About_page'
import ForgotPassword from './Components/Auth pages/ForgotPassword'
import ResetPassword from './Components/Auth pages/ResetPassword'

import { GoogleOAuthProvider } from '@react-oauth/google';
import Login_page from './Components/Auth pages/LoginPage'
import Login_otp_page from './Components/Auth pages/Login_otp_page'
import Profile_page from './Components/Profile page/Profile_page'
import ManageProfile from './Components/Profile page/Manage_profile_page'
import Order_page from './Components/Profile page/Order_page'
import Address_page from './Components/Profile page/Address_page'
import UserProtectedWrapper from './Components/contexts/User_protected_wrapper'
import DashboardLayout from './Components/superadmin pages/Dashboard_page'
import Logout_page from './Components/Auth pages/Logout_page'


const App = () => {

  const GoogleAuthWrapperRegister = () =>{
    return (
     
      <GoogleOAuthProvider clientId='217294656297-nc989cchar28fvgrl30jtq0ss44g3jiv.apps.googleusercontent.com'>
        <Register_pages/>
      </GoogleOAuthProvider>
      
    )
  }
  const GoogleAuthWrapperLogin = () =>{
    return (
     
      <GoogleOAuthProvider clientId='217294656297-nc989cchar28fvgrl30jtq0ss44g3jiv.apps.googleusercontent.com'>
        <Login_page/>
      </GoogleOAuthProvider>
      
    )
  }
return (
  <>
    <Router>
      <Routes>
        {/*-----------> user routes */}
        <Route path="/" element={<Home_page />} />
        <Route path="/user/about" element={<About />} />


        <Route path="/product/allProducts" element={<AllProduct />} />
        <Route path="/product/productsTemp/:id" element={<Product_details_template />} />
        <Route path="/user/login-otp" element={<Login_otp_page />} /> 


        {/* auth pages */}
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/reset-password/:token" element={<ResetPassword />} />



        {/* profile pages */}
        <Route path="/user/profile" element={<UserProtectedWrapper><Profile_page /></UserProtectedWrapper>} />
        <Route path="/user/manage_profile" element={<UserProtectedWrapper><ManageProfile /></UserProtectedWrapper>} />
        <Route path="/user/orders" element={<UserProtectedWrapper><Order_page /></UserProtectedWrapper>} />
        <Route path="/user/address_" element={<UserProtectedWrapper><Address_page /></UserProtectedWrapper>} />
        {/* admin pages */}
        <Route path="/admin/dashboard" element={<DashboardLayout />} />



        {/* ------------- auth routes  */}
        <Route path='*' element={<PageNotFound />} />
        <Route path="/user/register" element={<GoogleAuthWrapperRegister/>}/>
        <Route path="/user/signin" element={<GoogleAuthWrapperLogin/>}/>
        <Route path="/user/logout" element={<Logout_page/>}/>
      </Routes>
    </Router>
  </>
)

}
export default App
