import React, { useState, useEffect } from 'react';
import './Home_page_2.css';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import ProductCard from '../Product_pages/ProductCard';
import { gsap } from 'gsap';

const Homepage2_templates = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        console.log(`Fetching products for category: ${category}`);
        const response = await fetch(`/api/products?category=${category}`);
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage;
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || `Failed to fetch products: ${response.status}`;
          } else {
            const text = await response.text();
            errorMessage = `Server error: ${response.status} - ${text}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`Fetched products for category ${category}:`, data);
        setProducts(data);
      } catch (err) {
        console.error(`Error fetching products for category ${category}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = async (item) => {
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

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (products.length === 0 && !loading && !error) {
    return <div className="text-center py-10 text-gray-500">No products available in this category.</div>;
  }

  return (
    <div className="p-2 h-[60vh] w-full rounded-2xl overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={10}
        slidesPerView={5}
        navigation
        loop={true}
        className="swiper_"
        breakpoints={{
          0: { slidesPerView: 1 },
          700: { slidesPerView: 5 },
        }}
        onSwiper={(swiper) => {
          gsap.to(swiper.el, { scale: 1.05, duration: 0.5 });
        }}
      >
        {products.map((item, index) => (
          <SwiperSlide className="swiper_slider_cln" key={index}>
            <div className="home_p_products_card_ bg-white rounded-2xl shadow-md">
              <ProductCard
                filId={item._id}
                name={item.name}
                product_img={item.image}
                price={item.price}
                offer={item.discount ? `${item.discount}% off` : null}
                item_={item}
                quantity={item.countInStock}
                onAddToCart={() => handleAddToCart(item)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Homepage2_templates;