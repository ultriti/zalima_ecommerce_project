import { useState } from "react";
import { Heart, Share, Twitter } from "lucide-react";

export default function Product_page() {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

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

  const storageOptions = [
    { size: "64GB", active: true },
    { size: "128GB", active: false },
    { size: "256GB", active: false },
    { size: "512GB", active: false }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <div className="bg-gray-100 p-2 px-4 text-sm flex items-center border-b border-gray-200">
        <span className="text-gray-600">Home</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="text-gray-600">Kitchen Appliances</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="text-gray-600">MacBook Pro Laptop M2 Pro Chip With 10-Core CPU</span>
      </div>

      {/* Product Container */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col md:flex-row bg-white rounded shadow-sm">
          {/* Product Image Column */}
          <div className="md:w-1/2 p-6 flex items-center justify-center">
            <img 
              src="/api/placeholder/500/350" 
              alt="MacBook Pro" 
              className="max-w-full h-auto"
            />
          </div>

          {/* Product Details Column */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold mb-2">MacBook Pro Laptop M2 Pro chip with 10-core CPU</h1>
            
            {/* Rating Stars */}
            <div className="flex mb-4">
              <span className="text-yellow-400 text-xl">★★</span>
              <span className="text-gray-300 text-xl">★★★</span>
            </div>

            {/* Product Details */}
            <div className="mb-4 text-gray-600 text-sm">
              <span className="font-medium">Brand:</span> Samsung | 
              <span className="font-medium"> Reference:</span> MAC85SKD95 | 
              <span className="font-medium"> Condition:</span> Refurbished
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                The unibody model debuted in October 2008 in 13- and 15-inch variants, with a 17-inch
                variant added in January 2009. Called the "unibody" model because its case was machined
                from a single piece of aluminum
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2"><span className="font-medium">Color:</span> Grey</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color, index) => (
                  <div 
                    key={index}
                    className={`w-8 h-8 rounded-full ${color.class} cursor-pointer ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}
                    title={color.name}
                  ></div>
                ))}
              </div>
            </div>

            {/* Storage Selection */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2"><span className="font-medium">Storage:</span> 64GB</p>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map((option, index) => (
                  <div 
                    key={index}
                    className={`px-4 py-2 rounded border ${option.active ? 'bg-white font-medium border-gray-400' : 'bg-gray-100 border-gray-200'} cursor-pointer`}
                  >
                    {option.size}
                  </div>
                ))}
              </div>
            </div>

            {/* Price and Shipping */}
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-blue-600 mb-1">$299.00</h2>
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
                    className="border-l border-b border-gray-300 px-2 py-1 text-xs"
                  >
                    ▲
                  </button>
                  <button 
                    onClick={decreaseQuantity}
                    className="border-l border-gray-300 px-2 py-1 text-xs"
                  >
                    ▼
                  </button>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded flex-grow text-center">
                Add To Cart
              </button>
            </div>

            {/* Wishlist and Compare */}
            <div className="flex gap-4 mb-6">
              <button className="text-gray-700 flex items-center gap-1 text-sm">
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
              <button className="text-gray-700 flex items-center gap-1 text-sm">
                <Heart size={16} />
                Add To Wishlist
              </button>
            </div>

            {/* Social Sharing */}
            <div className="flex gap-2">
              <button className="bg-blue-800 text-white text-sm px-4 py-2 rounded flex items-center gap-1">
                <Share size={14} /> Share
              </button>
              <button className="bg-blue-400 text-white text-sm px-4 py-2 rounded flex items-center gap-1">
                <Twitter size={14} /> Tweet
              </button>
              <button className="bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.5 19c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-4.5-1c0-2.57-2.43-3-2.5-3-.17 0-.32-.09-.41-.24-.07-.12-.07-.27-.01-.4.27-.59.83-.98 1.42-.98h1c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-1c-.79 0-1.54.39-2 1.04-.46.66-.54 1.51-.2 2.25.28.61.93 1.35 1.7 1.85v2.48zm2.5-6.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
                </svg>
                Pinterest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}