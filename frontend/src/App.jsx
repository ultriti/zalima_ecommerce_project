import React from 'react'
import "./App.css"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LoginPage from './Components/Auth pages/LoginPage'
import Signup_page from './Components/Auth pages/Signup_page'
import Home_page from './Components/Home page/Home_page'
import PageNotFound from './Components/Common frames/PageNotFound'
import AllProduct from './Components/Product_pages/AllProduct'
import  Product_details_template from './Components/Product_pages/Product_details_template'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          {/*-----------> user routes */}
          <Route path="/" element={<Home_page />} />
          <Route path="/product/allProducts" element={<AllProduct />} />
          <Route path="/product/productsTemp/:id" element={<Product_details_template />} />

          {/* ------------- auth routes  */}
          <Route path="/register" element={<Signup_page />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path='*' element={<PageNotFound/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
