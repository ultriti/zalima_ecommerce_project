// import React, { useEffect, useState } from 'react'
// import "./AllProduct.css"
// import Navbar_frame from '../Common frames/Navbar_frame'
// import Website_features from '../Common frames/Website_features'
// import items_ from "./products.json"
// import Footer_frame from '../Common frames/Footer_frame'
// import ProductCard from './ProductCard'

// function AllProduct() {
//   const [items, setitems] = useState(items_)

//   // ----------- states

//   const [selectedFilters, setselectedFilter] = useState([])
//   const [filteredItems, setfilteredItems] = useState(items)
//   let filters = ["girl", "boy", "Wedding", "men", "women"]


//   const handleFilterBtnclick = (selectedcatagory) => {
//     if (selectedFilters.includes(selectedcatagory)) {
//       let filters = selectedFilters.filter((el) => el !== selectedcatagory)
//       setselectedFilter(filters)
//     } else {
//       setselectedFilter([...selectedFilters, selectedcatagory])
//     }
//   }

//   useEffect(() => {
//     filteredItems_();
//   }, [selectedFilters])

//   const filteredItems_ = () => {
//     if (selectedFilters.length > 0) {
//       let tempItems = selectedFilters.map((catagory) => {
//         let temp = items.filter((item) => item.category === catagory);
//         return temp;
//       });

//       setfilteredItems(tempItems.flat());
//     } else {
//       setfilteredItems([...items])
//     }
//   }



//   return (
//     <div className='getAllProducts_frame  '>

//       <div className="gettAllProducts_cont ">
//         {/* ----------------------> navbarframe */}
//         <div className="Navbar_frame fixed top:0 left-0 z-50 ">
//           <Navbar_frame />
//         </div>


//         {/* --------------------> basic features div */}
//         <div className="website_features_div">
//           <Website_features />
//         </div>

//         {/* -----------------------> display all avalable prodyct div */}
//         <div className="displayAllProduct_frame min-h-full  bg-gray-100 py-45 px-0 md:py-10 md:px-10 rounded-1xl">
//           <div className="display_products_cont min-h-full w-[100%]  bg-white rounded-[20px] md:px-5 ">


//             <div className="filter_options_frame  flex-row flex gap-1 mt-0 md:mt-1  md:px-2 ">
//               <span className='py-2 px-5 bg-gray-200'>mems</span>
//               <span className='py-2 px-5 bg-gray-200'>women</span>
//               <span className='py-2 px-5 bg-gray-200'>mems</span>
//               <span className='py-2 px-5 bg-gray-200'>mems</span>
//             </div>

//             <div className={`display_filtering_frame min-h-[10vh]  w-full flex flex-wrap py-5  items-center px-1 gap-2 ms:px-10 `}>

//               {
//                 filters.map((filters_, index) => (

//                   <span className={`min-w-10 rounded-[20px] text-[2vw] font-[600] border-1 border-gray-400  py-1 px-7 ${selectedFilters?.includes(filters_) ? "bg-blue-300" : "bg-white"} md:text-[1.1vw]`} onClick={() => { handleFilterBtnclick(filters_) }} key={index}>
//                     {filters_}
//                   </span>
//                 ))
//               }

//             </div>

//             {/* display filtered frames */}
//             <div className="peoducts_display_frame  cursor-pointer min-h-[100vh] w-[100%]  flex flex-col flex-wrap gap-2 py-3 px-2 md:flex-row md:w-[100%] ma:px-0">
//               {
//                 filteredItems.length > 0 ? (
//                   filteredItems.map((item, index) => (
//                     <a href={`/product/productsTemp/${item._id}`} key={index}>
//                       <div className="productTemplate_frame flex bg-blue-200 items-center justify-center overflow-hidden ">
//                         <ProductCard name={item.name} product_img={item.image} price={item.price} offer={item.offer} />
//                       </div></a>
//                   ))
//                 ) : (
//                   <>
//                     <h1>no products found</h1>
//                   </>
//                 )

//               }
//             </div>
//           </div>
//         </div>

//         {/* footer frame */}
//         <div className="footer_frame_">
//           <Footer_frame />
//         </div>
//       </div>

//     </div>
//   )
// }

// export default AllProduct

// -------------------------------------
import React, { useEffect, useState } from 'react';
import "./AllProduct.css";
import Navbar_frame from '../Common frames/Navbar_frame';
import Website_features from '../Common frames/Website_features';
import items_ from "./products.json";
import Footer_frame from '../Common frames/Footer_frame';
import ProductCard from './ProductCard';
import Slider from '@mui/material/Slider';


function AllProduct() {
  const [items, setitems] = useState(items_);

  // ----------- states

  const [selectedFilters, setselectedFilter] = useState([]);
  const [filteredItems, setfilteredItems] = useState(items);
  const [priceRange, setPriceRange] = useState([0, 7000]); // Adjust the range according to your data
  let filters = ["girl", "boy", "Wedding", "men", "women"];

  const handleFilterBtnclick = (selectedcatagory) => {
    if (selectedFilters.includes(selectedcatagory)) {
      let filters = selectedFilters.filter((el) => el !== selectedcatagory);
      setselectedFilter(filters);
    } else {
      setselectedFilter([...selectedFilters, selectedcatagory]);
    }
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  useEffect(() => {
    filteredItems_();
  }, [selectedFilters, priceRange]);

  const filteredItems_ = () => {
    let tempItems = items;

    if (selectedFilters.length > 0) {
      tempItems = selectedFilters.flatMap((catagory) => {
        return tempItems.filter((item) => item.category === catagory);
      });
    }

    tempItems = tempItems.filter((item) => {
      return item.price >= priceRange[0] && item.price <= priceRange[1];
    });

    setfilteredItems(tempItems);
  };

  return (
    <div className='getAllProducts_frame'>

      <div className="gettAllProducts_cont">
        {/* ----------------------> navbarframe */}
        <div className="Navbar_frame fixed top:0 left-0 z-50">
          <Navbar_frame />
        </div>

        {/* --------------------> basic features div */}
        <div className="website_features_div">
          <Website_features />
        </div>

        {/* -----------------------> display all available product div */}
        <div className="displayAllProduct_frame min-h-full  bg-gray-100 py-45 px-0 md:py-10 md:px-10 rounded-1xl">
          <div className="display_products_cont min-h-full w-[100%]  bg-white rounded-[20px] md:px-5">

            <div className="filter_options_frame flex-row flex gap-1 mt-0 md:mt-1  md:px-2">
              <span className='py-2 px-5 bg-gray-200'>mems</span>
              <span className='py-2 px-5 bg-gray-200'>women</span>
              <span className='py-2 px-5 bg-gray-200'>mems</span>
              <span className='py-2 px-5 bg-gray-200'>mems</span>
            </div>

            <div className={`display_filtering_frame min-h-[10vh]  w-full flex flex-wrap py-5  items-center px-1 gap-2 ms:px-10`}>
              {
                filters.map((filters_, index) => (
                  <span className={`min-w-10 rounded-[20px] text-[2vw] font-[600] border-1 border-gray-400  py-1 px-7 ${selectedFilters?.includes(filters_) ? "bg-blue-300" : "bg-white"} md:text-[1.1vw]`} onClick={() => { handleFilterBtnclick(filters_) }} key={index}>
                    {filters_}
                  </span>
                ))
              }
            </div>

            {/* Price Range Slider */}
            <div className="price_filter_frame flex flex-col items-center my-4">
              <h3>Filter by Price</h3>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0} // Set the minimum value according to your data
                max={7000} // Set the maximum value according to your data
                step={10} // Adjust the step as needed
              />
              <p>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</p>
            </div>

            {/* display filtered frames */}
            <div className="products_display_frame cursor-pointer min-h-[100vh] w-[100%] flex flex-col flex-wrap gap-2 py-3 px-2 md:flex-row md:w-[100%] ma:px-0">
              {
                filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <a href={`/product/productsTemp/${item._id}`} key={index}>
                      <div className="productTemplate_frame flex bg-blue-200 items-center justify-center overflow-hidden">
                        <ProductCard name={item.name} product_img={item.image} price={item.price} offer={item.offer} />
                      </div>
                    </a>
                  ))
                ) : (
                  <h1>No products found</h1>
                )
              }
            </div>
          </div>
        </div>

        {/* footer frame */}
        <div className="footer_frame_">
          <Footer_frame />
        </div>
      </div>

    </div>
  );
}

export default AllProduct;

