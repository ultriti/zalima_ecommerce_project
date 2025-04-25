import React, { useEffect } from 'react'
import "./App.css"
import { Route, Routes, Navigate } from "react-router-dom"
import Register_pages from './Components/Auth pages/Register_pages'
import Home_page from './Components/Home page/Home_page'
import PageNotFound from './Components/Common frames/PageNotFound'
import AllProduct from './Components/Product_pages/AllProduct'
import Product_details_template from './Components/Product_pages/Product_details_template'
import About from './Components/About page/About_page'
import ForgotPassword from './Components/Auth pages/ForgotPassword'
import ResetPassword from './Components/Auth pages/ResetPassword'
import AdminLogin from './Components/Auth pages/AdminLogin';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login_otp_page from './Components/Auth pages/Login_otp_page'
import Profile_page from './Components/Profile page/Profile_page'
import ManageProfile from './Components/Profile page/Manage_profile_page'
import Order_page from './Components/Profile page/Order_page'
import Address_page from './Components/Profile page/Address_page'
import UserProtectedWrapper from './Components/contexts/User_protected_wrapper'
import DashboardLayout from './Components/superadmin pages/Dashboard_page'
import Logout_page from './Components/Auth pages/Logout_page'
import Login_page from './Components/Auth pages/LoginPage'
import VendorDashboard from './Components/Vendor/VendorDashboard';
import AddProduct from './Components/Vendor/AddProduct';
import VendorRequestForm from './Components/User/VendorRequestForm';
import ManageVendorRequests from './Components/Admin/ManageVendorRequests';
import ManageUsers from './Components/Admin/ManageUsers';
import ManageAdmins from './Components/Admin/ManageAdmins';
import ManageVendors from './Components/Admin/ManageVendors';
import AdminDashboard from './Components/Admin/AdminDashboard';
import AdminProfile from './Components/Admin/AdminProfile';

// Role-based route protection
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/signin" replace />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const App = () => {
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Routes>
        {/* Basic Routes */}
        <Route path="/" element={<Home_page />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<AllProduct />} />
        <Route path="/product/:id" element={<Product_details_template />} />
        <Route path="/unauthorized" element={<div className="p-10 text-center"><h1 className="text-2xl">Unauthorized Access</h1><p>You don't have permission to access this page.</p></div>} />
        
        {/* Auth Routes with multiple paths */}
        <Route path="/register" element={<Register_pages />} />
        <Route path="/signup" element={<Register_pages />} />
        <Route path="/user/register" element={<Register_pages />} />
        <Route path="/user/signup" element={<Register_pages />} />
        
        <Route path="/login" element={<Login_page />} />
        <Route path="/signin" element={<Login_page />} />
        <Route path="/user/login" element={<Login_page />} />
        <Route path="/user/signin" element={<Login_page />} />
        
        <Route path="/login-otp" element={<Login_otp_page />} />
        <Route path="/user/login-otp" element={<Login_otp_page />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/user/reset-password/:token" element={<ResetPassword />} />
        
        <Route path="/logout" element={<Logout_page />} />
        <Route path="/user/logout" element={<Logout_page />} />
        
        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signin" element={<AdminLogin />} />
        
        {/* Protected User Routes */}
        <Route path="/profile" element={<UserProtectedWrapper><Profile_page /></UserProtectedWrapper>} />
        <Route path="/user/profile" element={<UserProtectedWrapper><Profile_page /></UserProtectedWrapper>} />
        
        <Route path="/manage-profile" element={<UserProtectedWrapper><ManageProfile /></UserProtectedWrapper>} />
        <Route path="/user/manage-profile" element={<UserProtectedWrapper><ManageProfile /></UserProtectedWrapper>} />
        
        <Route path="/orders" element={<UserProtectedWrapper><Order_page /></UserProtectedWrapper>} />
        <Route path="/user/orders" element={<UserProtectedWrapper><Order_page /></UserProtectedWrapper>} />
        
        <Route path="/address" element={<UserProtectedWrapper><Address_page /></UserProtectedWrapper>} />
        <Route path="/user/address" element={<UserProtectedWrapper><Address_page /></UserProtectedWrapper>} />
        
        <Route path="/become-vendor" element={<UserProtectedWrapper><VendorRequestForm /></UserProtectedWrapper>} />
        <Route path="/user/become-vendor" element={<UserProtectedWrapper><VendorRequestForm /></UserProtectedWrapper>} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={
          <RoleProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/vendor/add-product" element={
          <RoleProtectedRoute allowedRoles={['vendor']}>
            <AddProduct />
          </RoleProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminProfile />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageUsers />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/admins" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageAdmins />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/vendors" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageVendors />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/vendor-requests" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageVendorRequests />
          </RoleProtectedRoute>
        } />
        
        {/* Super Admin Routes */}
        <Route path="/superadmin/dashboard" element={<DashboardLayout />} />
        
        {/* Redirects for common paths */}
        <Route path="/user" element={<Navigate to="/user/profile" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
        
        {/* 404 Route - must be last */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App
