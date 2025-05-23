import React, { useState, useEffect } from 'react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import gsap from 'gsap';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';
import './Homepage_1.css';
import { ShoppingCart, Heart, ArrowRight } from 'lucide-react';

const HomePage_1 = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback products in case API fails
  const fallbackProducts = [
    {
      _id: 'fallback-1',
      name: 'Sample Product 1',
      price: 1999,
      image: '/api/placeholder/400/300',
      description: 'High-quality sample product with amazing features.',
      rating: 4.5,
      discount: 10
    },
    {
      _id: 'fallback-2',
      name: 'Sample Product 2',
      price: 2999,
      image: '/api/placeholder/400/300',
      description: 'Premium sample product for discerning customers.',
      rating: 4.8,
      discount: 15
    },
    {
      _id: 'fallback-3',
      name: 'Sample Product 3',
      price: 1499,
      image: '/api/placeholder/400/300',
      description: 'Affordable yet quality sample product.',
      rating: 4.2,
      discount: 5
    }
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try different API endpoints in order of preference
        const apiEndpoints = [
          '/api/products?featured=true&limit=3',
          '/api/products?limit=3',
          '/api/products'
        ];
        
        let lastError = null;
        
        for (const endpoint of apiEndpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              const contentType = response.headers.get('content-type');
              let errorMessage;
              if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || `Failed to fetch products from ${endpoint}: ${response.status}`;
              } else {
                const text = await response.text();
                errorMessage = `Server error at ${endpoint}: ${response.status} - ${text}`;
              }
              lastError = new Error(errorMessage);
              continue; // Try next endpoint
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              lastError = new Error(`${endpoint} returned non-JSON response`);
              continue; // Try next endpoint
            }

            const data = await response.json();
            console.log(`Successfully fetched from ${endpoint}:`, data);
            
            // Handle different response formats
            let products = data;
            if (data.products) {
              products = data.products; // If wrapped in a products property
            } else if (data.data) {
              products = data.data; // If wrapped in a data property
            }
            
            // Validate the data structure
            if (!Array.isArray(products)) {
              lastError = new Error(`Invalid data format from ${endpoint}: expected array`);
              continue; // Try next endpoint
            }

            // Take only first 3 products if more are returned
            const limitedProducts = products.slice(0, 3);

            // Ensure each product has required fields
            const validatedProducts = limitedProducts.map((product, index) => ({
              _id: product._id || product.id || `product-${Date.now()}-${index}`,
              name: product.name || product.title || 'Unnamed Product',
              price: product.price || product.cost || 0,
              image: product.image || product.imageUrl || product.images?.[0] || '/api/placeholder/400/300',
              description: product.description || product.desc || 'No description available',
              rating: product.rating || product.averageRating || 4.0,
              discount: product.discount || product.discountPercentage || 0
            }));

            setProducts(validatedProducts);
            return; // Success! Exit the loop
            
          } catch (fetchError) {
            console.error(`Error with ${endpoint}:`, fetchError);
            lastError = fetchError;
            continue; // Try next endpoint
          }
        }
        
        // If we get here, all endpoints failed
        throw lastError || new Error('All API endpoints failed');
        
      } catch (err) {
        console.error('All fetch attempts failed:', err);
        setError(err.message);
        // Use fallback products if API fails
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleMouseEnter = (index) => {
    gsap.to(`.product_hp1_overlay_${index}`, {
      duration: 0.3,
      opacity: 1,
      visibility: 'visible',
      display: 'flex',
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = (index) => {
    gsap.to(`.product_hp1_overlay_${index}`, {
      duration: 0.2,
      opacity: 0,
      visibility: 'hidden',
      display: 'none',
      ease: 'power2.in',
    });
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        window.location.href = '/user/signin';
        return;
      }

      console.log(`Adding to cart: ${item.name} (ID: ${item._id})`);
      const response = await fetch('/api/users/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item._id,
          quantity: 1,
          selectedVariant: {
            price: item.price,
          },
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || `Failed to add to cart: ${response.status}`;
        } else {
          const text = await response.text();
          errorMessage = `Server error: ${response.status} - ${text}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`Successfully added to cart: ${item.name}`, data);
      alert(`Added ${item.name} to cart!`);
    } catch (error) {
      console.error(`Error adding ${item.name} to cart:`, error);
      alert(`Failed to add item to cart: ${error.message}`);
    }
  };

  const handleAddToWishlist = async (e, item) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to wishlist');
        window.location.href = '/user/signin';
        return;
      }

      console.log(`Adding to wishlist: ${item.name} (ID: ${item._id})`);
      const response = await fetch('/api/users/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item._id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || `Failed to add to wishlist: ${response.status}`;
        } else {
          const text = await response.text();
          errorMessage = `Server error: ${response.status} - ${text}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`Successfully added to wishlist: ${item.name}`, data);
      alert(`Added ${item.name} to wishlist!`);
    } catch (error) {
      console.error(`Error adding ${item.name} to wishlist:`, error);
      alert(`Failed to add item to wishlist: ${error.message}`);
    }
  };

  const handleViewDetails = (e, item) => {
    e.stopPropagation();
    window.location.href = `/product/productsTemp/${item._id}`;
  };

  useEffect(() => {
    gsap.from('.home_page_1_frame', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      ease: 'power3.out',
    });

    products.forEach((_, index) => {
      gsap.set(`.product_hp1_overlay_${index}`, {
        opacity: 0,
        visibility: 'hidden',
        display: 'none',
      });
    });
  }, [products]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .product-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;
        color: white;
        border: none;
        outline: none;
      }
      .product_hp1_overlay_div {
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .home_p_products_card_ {
        position: relative;
        overflow: hidden;
        height: 100%;
        width: 100%;
      }
      .error-message {
        background-color: #fee;
        border: 1px solid #fcc;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        color: #c33;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-600">Loading featured products...</div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl text-red-600">Unable to load products</h2>
          <p className="text-gray-600 mt-2">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home_page_1_frame w-full h-full flex flex-col items-center">
      {error && (
        <div className="error-message">
          <p>Note: {error} Showing sample products instead.</p>
        </div>
      )}
      
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        onSwiper={(swiper) => {
          gsap.to(swiper.el, { scale: 1, duration: 0.5 });
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="swiper_ rounded-2xl overflow-hidden"
      >
        {products.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative home_p_products_card_ w-full h-[50vh] md:h-[90vh] flex flex-col md:flex-row items-center justify-center bg-white p-4 md:p-8"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
            >
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-[40vh] md:max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/300';
                  }}
                />
              </div>

              <div className="relative w-full md:w-1/2 flex flex-col justify-center p-4 md:p-8">
                <div
                  className={`product_hp1_overlay_${index} product_hp1_overlay_div w-full h-full flex-col items-center justify-center gap-4 md:gap-6`}
                >
                  <div className="flex items-center justify-center gap-2 md:gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 md:w-24 md:h-24 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                    {item.discount > 0 && (
                      <span className="bg-red-500 text-white text-xs md:text-sm px-2 py-1 rounded-full">
                        {item.discount}% off
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <h2 className="text-white text-lg md:text-2xl font-bold">{item.name}</h2>
                    <p className="text-white text-base md:text-lg mt-2">
                      ₹ {item.price}
                      {item.discount > 0 && (
                        <span className="line-through text-gray-400 ml-2">
                          ₹ {Math.round(item.price / (1 - item.discount / 100))}
                        </span>
                      )}
                    </p>
                    <div className="flex justify-center items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 md:w-5 md:h-5 ${i < Math.round(item.rating || 4) ? 'text-yellow-400' : 'text-gray-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.971c.3.921-.755 1.688-1.54 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.971a1 1 0 00-.364-1.118L2.31 9.397c-.783-.57-.381-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.97z" />
                        </svg>
                      ))}
                      <span className="text-white text-sm ml-2">({item.rating || 4})</span>
                    </div>
                    <p className="text-gray-200 text-sm md:text-base mt-2">{item.description || 'No description available'}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                    <button
                      className="product-button bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                      Add to Cart
                    </button>
                    <button
                      className="product-button bg-gray-600 hover:bg-gray-700"
                      onClick={(e) => handleAddToWishlist(e, item)}
                    >
                      <Heart className="w-4 h-4 md:w-5 md:h-5" />
                      Wishlist
                    </button>
                  </div>

                  <button
                    className="product-button bg-green-600 hover:bg-green-700 mt-2"
                    onClick={(e) => handleViewDetails(e, item)}
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  </button>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-gray-800 text-lg md:text-2xl font-bold">{item.name}</h2>
                  <p className="text-gray-600 text-base md:text-lg mt-2">
                    ₹ {item.price}
                    {item.discount > 0 && (
                      <span className="line-through text-gray-400 ml-2">
                        ₹ {Math.round(item.price / (1 - item.discount / 100))}
                      </span>
                    )}
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={(e) => handleAddToCart(e, item)}
                  >
                    <ShoppingCart className="w-5 h-5 inline-block mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Featured Categories</h2>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {['Men', 'Women', 'Kids', 'Wedding'].map((category, index) => (
            <div
              key={index}
              className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full flex flex-col items-center justify-center text-gray-800 font-semibold"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-300 rounded-full flex items-center justify-center text-xl md:text-2xl">
                {category[0]}
              </div>
              <p className="mt-2 text-sm md:text-base">{category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage_1;