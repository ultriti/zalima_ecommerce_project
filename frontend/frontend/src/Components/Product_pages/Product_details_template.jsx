import { useEffect, useState } from "react";
import { Heart, Share, Twitter, ChevronLeft, ChevronRight } from "lucide-react";
import laptop1 from '../../../public/images/facebook_icon.svg'
import laptop2 from '../../../public/images/facebook_icon.svg'
import laptop3 from '../../../public/images/facebook_icon.svg'
import laptop4 from '../../../public/images/facebook_icon.svg'

import { useParams } from "react-router-dom"
import items from "./products.json"
import Navbar_frame from "../Common frames/Navbar_frame";
import Website_features from "../Common frames/Website_features";
import Footer_frame from "../Common frames/Footer_frame";
import { toast } from 'react-toastify';


const Product_details_template = (props) => {
  const [data, setdata] = useState([...items])
  const [items_value, setitems_value] = useState([])
  const { id } = useParams()

  useEffect(() => {
    const result = data.find(item => item._id === Number(id));
    setitems_value(result);
  }, [data, id]);


  // State for quantity
  const [quantity, setQuantity] = useState(1);

  // State for selected color
  const [selectedColor, setSelectedColor] = useState("Grey");

  // State for selected storage option
  const [selectedStorage, setSelectedStorage] = useState("64GB");

  // State for carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  // Product images for carousel
  console.log(data);

  const productImages = [items_value.image];

  // Color options with actual color values
  const colorOptions = [
    { name: "Grey", class: "bg-gray-400" },
    { name: "Beige", class: "bg-amber-200" },
    { name: "Cream", class: "bg-yellow-50" },
    { name: "Light Peach", class: "bg-orange-100" },
    { name: "Red", class: "bg-red-500" },
    { name: "Dark Grey", class: "bg-gray-800" },
    { name: "Brown", class: "bg-amber-700" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Green", class: "bg-green-500" }
  ];

  // Storage options
  const storageOptions = ["64GB", "128GB", "256GB", "512GB"];

  // Price mapping based on storage
  const pricingMap = {
    "64GB": 299.00,
    "128GB": 399.00,
    "256GB": 499.00,
    "512GB": 699.00
  };

  // Handlers
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
  };

  const handleStorageSelect = (storage) => {
    setSelectedStorage(storage);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} MacBook Pro (${selectedColor}, ${selectedStorage}) to cart!`);
  };

  const handleAddToWishlist = () => {
    alert(`Added MacBook Pro (${selectedColor}, ${selectedStorage}) to wishlist!`);
  };

  const handleAddToCompare = () => {
    alert(`Added MacBook Pro to compare list!`);
  };

  return (
    <div className="product_template_frame flex flex-col min-h-[100vh] w-[100%]">
      {/* navbar frame */}
      <div className="Navbar_frame">
        <Navbar_frame />
      </div>
      {/* website features fraem */}
      <div className="website_features_div">
        <Website_features />
      </div>

      <div className="bg-gray-50 min-h-screen mt-[37vw] py-[10vw] md:py-[17px] md:mt-[130px]">

        {/* Navigation */}
        <div className="bg-gray-100 p-2 px-4 text-sm flex items-center border-b border-gray-200">
          <a href="/"><span className="text-gray-600 hover:text-blue-600 cursor-pointer">Home</span></a>
          <span className="mx-2 text-gray-300">|</span>
          <a href="/product/allProducts"><span className="text-gray-600 hover:text-blue-600 cursor-pointer">Kitchen Appliances</span></a>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-600">{items_value.name}</span>
        </div>

        {/* Product Container */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col md:flex-row bg-white rounded shadow-sm">
            {/* Product Image Carousel Column */}
            <div className="md:w-1/2 p-6">
              <div className="relative">
                {/* Main carousel image */}
                <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden border border-gray-200 rounded-md">
                  {productImages.map((img, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${items_value.name} View ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}

                  {/* Carousel controls */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1 z-20 hover:bg-opacity-75"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1 z-20 hover:bg-opacity-75"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Carousel thumbnails */}
                <div className="flex justify-center mt-4 gap-2">
                  {productImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => selectSlide(index)}
                      className={`w-16 h-16 border rounded cursor-pointer ${index === currentSlide ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-2xl font-bold mb-2">{items_value.name}</h1>

              {/* Rating Stars */}
              <div className="flex mb-4">
                <span className="text-yellow-400 text-xl">★★</span>
                <span className="text-gray-300 text-xl">★★★</span>
              </div>

              {/* Product Details */}
              <div className="mb-4 text-gray-600 text-sm">
                <span className="font-medium">Brand:</span> {items_value.brand} |
                <span className="font-medium"> Reference:</span> {items_value._id} |
                <span className="font-medium"> Condition:</span> Refurbished
              </div>

              {/* Product Description */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {items_value.desc}
                </p>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Color:</span> {selectedColor}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color, index) => (
                    <div
                      key={index}
                      onClick={() => handleColorSelect(color.name)}
                      className={`w-8 h-8 rounded-full ${color.class} cursor-pointer ${color.name === selectedColor ? 'ring-2 ring-blue-500' : ''
                        }`}
                      title={color.name}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Storage Selection */}
              {
                String(items_value.category) == "electronics" ? (
                  <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Storage:</span> {selectedStorage}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {storageOptions.map((storage, index) => (
                        <div
                          key={index}
                          onClick={() => handleStorageSelect(storage)}
                          className={`px-4 py-2 rounded border cursor-pointer ${storage === selectedStorage
                            ? 'bg-white font-medium border-gray-400'
                            : 'bg-gray-100 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {storage}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (<></>)

              }


              {/* Price and Shipping */}
              <div className="mb-6">
                <h2 className="text-3xl font-semibold text-blue-600 mb-1">
                  ₹{items_value.price}
                </h2>
                <p className="text-gray-500 text-sm">Free Shipping (Est. Delivery Time 2-3 Days)</p>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Add to Cart Section */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex border border-gray-300 rounded">
                  <input
                    type="text"
                    value={quantity}
                    className="w-12 text-center py-2"
                    readOnly
                  />
                  <div className="flex flex-col">
                    <button
                      onClick={increaseQuantity}
                      className="border-l border-b border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      ▲
                    </button>
                    <button
                      onClick={decreaseQuantity}
                      className="border-l border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded flex-grow text-center"
                >
                  Add To Cart
                </button>
              </div>

              {/* Wishlist and Compare */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCompare}
                  className="text-gray-700 flex items-center gap-1 text-sm hover:text-blue-600"
                >
                  <span className="p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                      <line x1="9" y1="9" x2="9" y2="15" />
                      <line x1="15" y1="9" x2="15" y2="15" />
                    </svg>
                  </span>
                  Add To Compare
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="text-gray-700 flex items-center gap-1 text-sm hover:text-blue-600"
                >
                  <Heart size={16} />
                  Add To Wishlist
                </button>
              </div>

              {/* Social Sharing */}
              <div className="flex gap-2">
                <button className="bg-blue-800 text-white text-sm px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-900">
                  <Share size={14} /> Share
                </button>
                <button className="bg-blue-400 text-white text-sm px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-500">
                  <Twitter size={14} /> Tweet
                </button>
                <button className="bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-1 hover:bg-red-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.5 19c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-4.5-1c0-2.57-2.43-3-2.5-3-.17 0-.32-.09-.41-.24-.07-.12-.07-.27-.01-.4.27-.59.83-.98 1.42-.98h1c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-1c-.79 0-1.54.39-2 1.04-.46.66-.54 1.51-.2 2.25.28.61.93 1.35 1.7 1.85v2.48zm2.5-6.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
                  </svg>
                  Pinterest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* footer frame */}
      <div className="footer_frame_">
        <Footer_frame />
      </div>

    </div>
  );
}

export default Product_details_template