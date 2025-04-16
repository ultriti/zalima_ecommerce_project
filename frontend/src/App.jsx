import React from 'react'
import "./App.css"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LoginPage from './Components/Auth pages/LoginPage'
import Signup_page from './Components/Auth pages/Signup_page'
import Home_page from './Components/Home page/Home_page'
import Product_page from './Components/Product_page/Product_Page'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          {/*-----------> user routes */}
          <Route path="/" element={<Home_page />} />

          {/* ------------- auth routes  */}
          <Route path="/register" element={<Signup_page />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ------------- components page */}
          <Route path="/product" element={<Product_page/>} />
          
        </Routes>
      </Router>

    </>
  )
}

export default App
