import React from "react";
import "./About_page.css";
import Header from "../Common frames/Header";
import Footer from "../Common frames/Footer";

const About = () => {
  return (
    <div className="about-container">
      <Header />
      <div className="about-content">
        <h1>About Us</h1>
        <p>Welcome to our e-commerce platform! We are dedicated to providing high-quality products and excellent customer service.</p>
        
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>Our mission is to create a seamless shopping experience for our customers while offering a wide range of products at competitive prices.</p>
        </div>
        
        <div className="about-section">
          <h2>Our Vision</h2>
          <p>We aim to become the leading e-commerce platform by focusing on customer satisfaction, product quality, and innovative shopping solutions.</p>
        </div>
        
        <div className="about-section">
          <h2>Our Team</h2>
          <p>Our team consists of dedicated professionals who are passionate about e-commerce and customer service. We work tirelessly to ensure that your shopping experience is nothing short of excellent.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;