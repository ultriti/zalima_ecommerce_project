import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import axios from 'axios';
import "./Navbar_frame.css";
import logo from "../../../public/images/logo.svg";
import cartSvg from "../../../public/images/cart.svg";
import items_ from "../Product_pages/products.json"; // Import products directly

const Navbar_frame = () => {
  const role = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [searchListVisible, setSearchListVisible] = useState(false);
  const [animateSearch, setAnimateSearch] = useState(false);
  const searchContainerRef = useRef(null);
  
  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem("myItems")) || [];
  const [itemsLength, setitemsLength] = useState(cartItems.length)


  useEffect(() => {
    setitemsLength(cartItems.length)
  }, [cartItems])
  
  
  // Use both items from localStorage and the imported products
  // This ensures we have products for search even if localStorage is empty
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // Combine localStorage items with imported products
    // Remove duplicates by creating a map with product IDs as keys
    const productMap = new Map();
    
    // Add imported products
    items_.forEach(item => {
      productMap.set(item._id, item);
    });
    
    // Add localStorage items (will overwrite imported items if same ID)
    cartItems.forEach(item => {
      productMap.set(item._id, item);
    });
    
    // Convert map back to array
    setAllProducts(Array.from(productMap.values()));
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navContainer = document.querySelector('.nav-container');
      if (isMobileMenuOpen && navContainer && !navContainer.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchListVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user profile and address in one request
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        // First fetch the profile
        const profileRes = await axios.get(
          `${import.meta.env.VITE_BASE_URI}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserProfile(profileRes.data);
        
        // Then fetch the address using the correct endpoint
        if (userId) {
          try {
            const addressRes = await axios.get(
              `${import.meta.env.VITE_BASE_URI}/api/users/${userId}/addresses`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            // Check if addresses array exists and has at least one address
            if (addressRes.data && Array.isArray(addressRes.data) && addressRes.data.length > 0) {
              // Use the first address (primary address)
              setUserAddress(addressRes.data[0]);
            } else if (addressRes.data && addressRes.data.address) {
              // Alternative format: direct address object
              setUserAddress(addressRes.data);
            }
          } catch (addressErr) {
            console.error('Error fetching user address:', addressErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSearchClick = () => {
    setSearchListVisible(!searchListVisible);
    setAnimateSearch(true);
    setTimeout(() => setAnimateSearch(false), 500);
  };

  const onSearch = (value) => {
    setSearchValue(value);
    setSearchListVisible(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Add search functionality here
    console.log("Searching for:", searchValue);
    // You could redirect to search results page or filter products
  };

  // Check if user profile image exists and is valid
  const hasValidProfileImage = () => {
    return (
      userProfile && 
      userProfile.profileImage && 
      userProfile.profileImage.url && 
      userProfile.profileImage.public_id !== 'default_profile'
    );
  };

  // Generate the appropriate address display or message
  const renderAddressSection = () => {
    if (loading) {
      return (
        <div className="address-container loading">
          <div className="address-loading-spinner"></div>
        </div>
      );
    }
    
    if (!userId) {
      return (
        <Link to="/user/signin" className="address-container no-address">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>Sign in to add shipping address</span>
        </Link>
      );
    }
    
    // Handle case where userAddress exists but has different structure
    const addressText = userAddress ? 
      (userAddress.street ? 
        `${userAddress.street}, ${userAddress.city}` : 
        (userAddress.address || "No address found")) 
      : "Add your shipping address";
    
    if (!userAddress || (!userAddress.address && !userAddress.street)) {
      return (
        <Link to={`/user/${userId}`} className="address-container no-address">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>Add your shipping address</span>
        </Link>
      );
    }
    
    return (
      <Link to={`/user/${userId}`} className="address-container has-address" title="Change address">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>{addressText.substring(0, 30)}{addressText.length > 30 ? '...' : ''}</span>
      </Link>
    );
  };

  return (
    <nav className="Navbar_frame">
      <div className="nav-container">
        {/* Logo - now properly aligned left */}
        <a href="/" className="nav-logo">
          <img src={logo} alt="Trendify Logo" />
          <span>Trendify</span>
        </a>
        
        {/* Address Section */}
        {renderAddressSection()}

        {/* Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}
          id="navbar-default"
        >
          <div className="search-container" ref={searchContainerRef}>
            {/* Form is now directly inside search-container */}
            <form onSubmit={handleSearchSubmit} className={`search_div ${animateSearch ? 'animate-search' : ''}`}>
              <input
                type="text"
                placeholder="Search Product Here..."
                onClick={handleSearchClick}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" aria-label="Search">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Search
              </button>
            </form>

            {/* Search results dropdown container outside the form but inside search-container */}
            {searchListVisible && searchValue && (
              <div className="display_searched_values">
                {allProducts
                  .filter((item) => {
                    if (!item || !item.name) return false;
                    const searchTerm = searchValue.toLowerCase();
                    const itemName = item.name.toLowerCase();
                    return searchTerm && itemName.includes(searchTerm);
                  })
                  .slice(0, 10) // Limit to 10 results for better UX
                  .map((item, index) => (
                    <Link
                      to={`/product/productsTemp/${item._id}`}
                      key={index}
                      onClick={() => onSearch(item.name)}
                    >
                      <div className="dropdown_item">
                        {item.name}
                      </div>
                    </Link>
                  ))}
                {allProducts.filter(item => item && item.name && item.name.toLowerCase().includes(searchValue.toLowerCase())).length === 0 && (
                  <div className="dropdown_item" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          <ul className="right-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/about"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/orders"
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                Track Orders
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/cart"
                className={({ isActive }) =>
                  `cart-link ${isActive ? 'active' : ''}`
                }
              >
                <div>
                  <img src={cartSvg} alt="Cart" />
                  <span>Cart ({itemsLength})</span>
                </div>
              </NavLink>
            </li>
            <li>
              {loading ? (
                <div className="loading-spinner" title="Loading profile"></div>
              ) : userId && userProfile ? (
                <Link
                  to={`/user/${userId}`}
                  className="profile-container"
                  title="Profile"
                >
                  {hasValidProfileImage() ? (
                    <img
                      src={userProfile.profileImage.url}
                      alt="Profile"
                      onLoad={(e) => e.target.classList.add('profile-loaded')}
                      style={{transition: 'opacity 0.3s ease', objectFit: 'cover'}}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="8" r="4" fill="currentColor" />
                      <path
                        d="M16 17c0-2.21-1.79-4-4-4s-4 1.79-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Link>
              ) : (
                <NavLink
                  to="/user/signin"
                  className={({ isActive }) =>
                    isActive ? 'active' : ''
                  }
                >
                  Log In
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar_frame;