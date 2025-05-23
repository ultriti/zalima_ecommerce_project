import React from 'react';
import img1 from "../../../public/images/register_page_bgc.svg"
import img2 from "../../../public/images/profile_pic.svg"
import { toast } from 'react-toastify';


const ProductCard = (props) => {

  const add_to_cart_handle = (newItem) => {

    let items_ = JSON.parse(localStorage.getItem("myItems")) || [];
    console.log(items_.map(item => item.name));
    if(items_.map(item => item.name).includes(newItem.name) === true) {
      alert('item already in cart')
      return;
    }else{
      items_.push(newItem);
      // Save back to local storage
      localStorage.setItem("myItems", JSON.stringify(items_));
      toast.success('added to cart successfully');
    }
    
  }



  return (
    <div className="flex flex-col items-center max-w-sm rounded overflow-hidden shadow-lg bg-white p-1 h-full w-[100%] md:p-2">

      <a href={`/product/productsTemp/${props.filId}`}>

        {/*--------------------> Discount and New Labels */}
        <div className="relative flex flex-col h-[30vh] rounded-2xl overflow-hidden">
          {
            props.offer > 0 ? (<span className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1">-{props.offer}%</span>
            ) : (<></>)
          }
          <span className="absolute top-0 right-0 bg-gray-200 text-gray-800 text-xs font-bold px-2 py-1">New</span>
          {/* Product Image */}
          <div className="product_card_div rounded-2xl overflow-hidden h-[25vh] w-full bg-red-500 flex bg-cover">
            <img className="w-full h-[100%] object-fit " src={props.product_img} alt="Canon Bluetooth Speaker" />
          </div>

        </div>

        {/*---------------------> Product Details */}
        <div className="flex flex-col w-full h-[20vh] overflow-y-auto p-0">
          <div className="font-[600] text-[1.2vw] flex flex-wrap">{props.name}</div>
          {/* Ratings */}
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-yellow-500">★★★★☆</span>
            </div>
          </div>
          {/* Pricing */}
          <div className="flex items-center mt-1">
            <span className="text-[1.5vw] font-bold text-green-600">₹{props.price}</span>
            <span className="text-gray-500 line-through ml-2">₹{props.price}</span>
          </div>
          {/* Stock Status */}
          <div className="mt-1 text-green-600">In Stock 1348 Products</div>
        </div>
        </a>

        {/* -------------------->  Add To Cart Button */}
        <div className="px-6 py-0">
          <button onClick={() => { add_to_cart_handle(props.item_) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add To Cart
          </button>
        </div>
    </div>
  );
};

export default ProductCard;
