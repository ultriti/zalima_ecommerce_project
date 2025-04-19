import React, { useEffect, useState } from 'react'
import "./AllProduct.css"
import Navbar_frame from '../Common frames/Navbar_frame'
import Website_features from '../Common frames/Website_features'
import items_ from "./products.json"
import Footer_frame from '../Common frames/Footer_frame'

function AllProduct() {
  const [items, setitems] = useState(items_)

  // ----------- states

  const [selectedFilters, setselectedFilter] = useState([])
  const [filteredItems, setfilteredItems] = useState(items)
  let filters = ["below 150$", "cloth", "electronics", "men", "women"]


  const handleFilterBtnclick = (selectedcatagory) => {
    if (selectedFilters.includes(selectedcatagory)) {
      let filters = selectedFilters.filter((el) => el !== selectedcatagory)
      setselectedFilter(filters)
    } else {
      setselectedFilter([...selectedFilters, selectedcatagory])
    }
  }

  useEffect(() => {
    filteredItems_();
  }, [selectedFilters])

  const filteredItems_ = () => {
    if (selectedFilters.length > 0) {
      let tempItems = selectedFilters.map((catagory) => {
        let temp = items.filter((item) => item.category === catagory);
        return temp;
      });

      setfilteredItems(tempItems.flat());
    } else {
      setfilteredItems([...items])
    }
  }



  return (
    <div className='getAllProducts_frame  '>

      <div className="gettAllProducts_cont ">
        {/* ----------------------> navbarframe */}
        <div className="Navbar_frame fixed top:0 left-0 z-50 ">
          <Navbar_frame />
        </div>


        {/* --------------------> basic features div */}
        <div className="website_features_div">
          <Website_features />
        </div>

        {/* -----------------------> display all avalable prodyct div */}
        <div className="displayAllProduct_frame h-full  bg-white py-45 px-0 md:py-10 md:px-10">
          <div className="filter_options_frame h-[2vw] flex-row flex gap-1 mt-0 md:mt-10">
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

          {/* display filtered frames */}

          <div className="peoducts_display_frame min-h-[100vh] w-[100%]  flex flex-col flex-wrap gap-2 py-3 px-2 md:flex-row md:w-[100%] ma:px-0">
            {
              filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  // console.log('id',item._id),
                  
                  <a href={`/product/productsTemp/${item._id}`}  key={index}>
                    <div className="productTemplate_frame flex flex-col gap-2 bg-blue-200 items-center justify-center ">
                      <p>{item.name}</p>
                      <p>{item.category}</p>
                    </div></a>

                ))
              ) : (
                <>
                  <h1>no products found</h1>
                </>
              )

            }
          </div>






        </div>

        {/* footer frame */}
        <div className="footer_frame_">
          <Footer_frame/>
        </div>




      </div>

    </div>
  )
}

export default AllProduct
