import React, { useEffect } from 'react';
import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Register_pages from './Components/Auth pages/Register_pages';
import Home_page from './Components/Home page/Home_page';
import PageNotFound from './Components/Common frames/PageNotFound';
import AllProduct from './Components/Product_pages/AllProduct';
import Product_details_template from './Components/Product_pages/Product_details_template';
import About from './Components/About page/About_page';
import ForgotPassword from './Components/Auth pages/ForgotPassword';
import ResetPassword from './Components/Auth pages/ResetPassword';
import AdminLogin from './Components/Auth pages/AdminLogin';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login_otp_page from './Components/Auth pages/Login_otp_page';
import Profile_page from './Components/Profile page/Profile_page';
import ManageProfile from './Components/Profile page/Manage_profile_page';
import Order_page from './Components/Profile page/Order_page';
import Address_page from './Components/Profile page/Address_page';
import UserProtectedWrapper from './Components/contexts/User_protected_wrapper';
import Logout_page from './Components/Auth pages/Logout_page';
import Login_page from './Components/Auth pages/LoginPage';
import VendorDashboard from './Components/Vendor/VendorDashboard';
import AddProduct from './Components/Vendor/AddProduct';
import EditProduct from './Components/Vendor/EditProduct';
import VendorRequestForm from './Components/User/VendorRequestForm';
import ManageVendorRequests from './Components/Admin/admin pages/ManageVendorRequests';
import ManageUsers from './Components/Admin/admin pages/ManageUsers';
import ManageAdmins from './Components/Admin/admin pages/ManageAdmins';
import ManageVendors from './Components/Admin/admin pages/ManageVendors';
import AdminDashboard from './Components/Admin/admin pages/AdminDashboard';
import AdminProfile from './Components/Admin/admin pages/AdminProfile';
import Contact_page from './Components/contact_page/Contact_page';
import CartPage from './Components/Product_pages/CartPage';
import SuperAdminDashboard from './Components/superadmin pages/Dashboard_page';
import ManageSuperAdminUsers from './Components/superadmin pages/ManageUsers';
import ManageSuperAdminVendors from './Components/superadmin pages/ManageVendors';
import ManageSuperAdminAdmins from './Components/superadmin pages/ManageAdmins';
import ManageSuperAdminVendorRequests from './Components/superadmin pages/ManageVendorRequests';
import SuperAdminProfile from './Components/superadmin pages/SuperAdminProfile';
import AdminDashboardLayout from './Components/Admin/admin pages/AdminDashboardLayout';
import ManageProductRequests from './Components/Admin/admin pages/ManageProductRequests';
import ManageSuperAdminProductRequests from './Components/superadmin pages/ManageSuperAdminProductRequests';
import UserProfile from './Components/User/UserProfile';
import PurchaseConformation from "./Components/Product_pages/PurchaseConformation"
import VendorAllProducts from './Components/Vendor/VendorAllProducts';
// import EditProduct from './Components/Vendor/EditProduct';

// Role-based route protection
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/user/signin" replace />;
  }

  if (!allowedRoles.includes(userRole?.toLowerCase())) {
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
        {/* Public Routes */}
        <Route path="/" element={<Home_page />} />
        <Route path="/user/about" element={<About />} />
        <Route path="/user/contact" element={<Contact_page />} />
        <Route path="/products/allProducts" element={<AllProduct />} />
        <Route path="/product/productsTemp/:id" element={<Product_details_template />} />
        <Route path="/unauthorized" element={<div className="p-10 text-center"><h1 className="text-2xl">Unauthorized Access</h1><p>You don't have permission to access this page.</p></div>} />

        {/* Auth Routes */}
        <Route path="/user/register" element={<Register_pages />} />
        <Route path="/user/signin" element={<Login_page />} />
        <Route path="/user/login-otp" element={<Login_otp_page />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/reset-password/:token" element={<ResetPassword />} />
        <Route path="/user/logout" element={<Logout_page />} />
        <Route path="/admin/signin" element={<AdminLogin />} />

        {/* Protected User Routes */}
        <Route path="/user/profile" element={<UserProtectedWrapper><Profile_page /></UserProtectedWrapper>} />
        <Route path="/user/manage_profile" element={<UserProtectedWrapper><ManageProfile /></UserProtectedWrapper>} />
        <Route path="/user/orders" element={<UserProtectedWrapper><Order_page /></UserProtectedWrapper>} />
        <Route path="/user/address" element={<UserProtectedWrapper><Address_page /></UserProtectedWrapper>} />
        <Route path="/user/cart" element={<UserProtectedWrapper><CartPage /></UserProtectedWrapper>} />
        <Route path="/user/become-vendor" element={<UserProtectedWrapper><VendorRequestForm /></UserProtectedWrapper>} />
        <Route path="/user/:id" element={<UserProtectedWrapper><UserProfile /></UserProtectedWrapper>} />
        <Route path="/user/purchase-confirmation" element={<UserProtectedWrapper><PurchaseConformation /></UserProtectedWrapper>} />
        <Route path="/user/purchase-confirmation" element={<PurchaseConformation />} />

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
        <Route path="/vendor/edit-product/:id" element={
          <RoleProtectedRoute allowedRoles={['vendor']}>
            <EditProduct />
          </RoleProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminDashboardLayout />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageUsers />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/vendors" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageVendors />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/product-requests" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageProductRequests />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminProfile />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/managevendorrequests" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageVendorRequests />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/admins" element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <ManageAdmins />
          </RoleProtectedRoute>
        } />

        {/* SuperAdmin Routes */}
        <Route path="/superadmin/dashboard" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/superadmin/users" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageSuperAdminUsers />
          </RoleProtectedRoute>
        } />
        <Route path="/superadmin/vendors" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageSuperAdminVendors />
          </RoleProtectedRoute>
        } />
        <Route path="/superadmin/admins" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageSuperAdminAdmins />
          </RoleProtectedRoute>
        } />
        <Route path="/superadmin/product-requests" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageSuperAdminProductRequests />
          </RoleProtectedRoute>
        } />
        <Route path="/superadmin/profile" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminProfile />
          </RoleProtectedRoute>
        } />
        <Route path="/superadmin/managevendorrequests" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageSuperAdminVendorRequests />
          </RoleProtectedRoute>
        } />
        <Route path="/vendor/products" element={
          <RoleProtectedRoute allowedRoles={['vendor']}>
            <VendorAllProducts />
          </RoleProtectedRoute>
        } />
        <Route
          path="/admin/product-requests/:id/view"
          element={
            <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <EditProduct readOnly />
            </RoleProtectedRoute>
          }
        />
        <Route path="/superadmin/product-requests" element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <ManageSuperAdminProductRequests />
          </RoleProtectedRoute>
        } />
        <Route path="/user/payment_conform" element={
          <RoleProtectedRoute allowedRoles={['user']}>
            <PurchaseConformation />
          </RoleProtectedRoute>
        } />

        {/* Catch-all Route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  );
};

export default App;