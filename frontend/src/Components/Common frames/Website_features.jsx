import React, { useState } from 'react'
import "./Website_features.css"
import { useNavigate } from 'react-router-dom';
import items from "../Product_pages/products.json"

const Website_features = () => {
  const nav = useNavigate()
  const [value, setvalue] = useState('');
  const [search_list_frame_bool, setsearch_list_frame_bool] = useState(false)

  const search_frame_display = () => {

    nav("/product/allProducts")
    setsearch_list_frame_bool(!search_list_frame_bool)
  }
  const onSearch = (vlaue) => {

    setvalue(vlaue);
    console.log('search', value);
  }


  return (
    <header className="bg-white h-[100%] w-[100%]" >

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex flex-col justify-between items-center md:flex-row">
        {/* Logo */}
        {/* <div className="flex items-center justify-center space-x-2">
        </div> */}

        {/* Search Bar */}
        <div className="flex-grow h-[7vh] mx-4 relative ">
          <div className="search_div h-5vh w-[80vw] flex flex-row  top-0 md:w-[100%]">
            <input
              type="text"
              placeholder="Search Product Here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onClick={() => { search_frame_display() }}
              value={value} onChange={(e) => (setvalue(e.target.value))}
            />
            <button className="absolute right-0 top-0 bg-blue-500 text-white px-4 py-2 rounded-r-lg">
              Search
            </button>
          </div>


          {search_list_frame_bool ? (
            <>
              <div className="display_serached_values w-[100%] bg-amber-600 px-5 py-2">

                {
                  items.filter(item => {
                    const search_ = value.toLowerCase();
                    const itemName = item.name.toLowerCase();
                    return search_ && itemName.includes(search_); // Change "startsWith" to "includes"
                  }).map((item, index) => {
                    return (
                      <a href={`/product/productsTemp/${item._id}`} key={index}>
                        <div className="dropdown_item min-h-[3vh] w-[100%] flex items-end" onClick={() => { onSearch(item.name) }}>
                          {item.name}
                        </div>
                      </a>
                    )
                  })
                }
              </div>
            </>
          ) : (
            <></>
          )
          }


        </div>

        {/* Navigation Icons */}
        <div className="flex space-x-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-600 text-xs">Store Locator</span>
          </div>
          <div className="flex flex-col items-center">
            <a href="/user/orders"><span className="text-gray-600 text-xs">Track Order</span></a>
          </div>
          <div className="flex flex-col items-center">
            <a href="/user/profile"><span className="text-gray-600 text-xs">My Account</span></a>
          </div>
          <div className="flex flex-col items-center">
            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4z" />
            </svg>
            <span className="text-gray-600 text-xs">Cart (0)</span>
          </div>
        </div>
      </div>

      {/* Bottom Promo Banner */}
      {/* <div className="bg-blue-400 h-[2.5vw] felx items-center justify-center text-white text-center py-2 text-sm font-semibold">
        Get 50% Off On First Order
      </div> */}
    </header >
  );
};

export default Website_features
