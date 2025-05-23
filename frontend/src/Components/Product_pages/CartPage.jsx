import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';

import CartProductTemp from './CartProductTemp';
import Navbar_frame from '../Common_frames/Navbar_frame';
import Website_features from '../Common_frames/Website_features';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const nav = useNavigate()
    // State to manage cart items
    const cart_items = JSON.parse(localStorage.getItem("myItems")) || [];
    const [cartItems, setCartItems] = useState(cart_items);


    // Function to increase quantity
    const incrementQty = (id) => {
        setCartItems(cartItems.map(item =>
            item._id === id ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    // Function to decrease quantity
    const decrementQty = (id) => {
        setCartItems(cartItems.map(item =>
            item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        ));
    };

    // Function to remove item
    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item._id !== id));
    };

    // Calculate subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const checkOutHandle = ()=>{
        nav("/user/payment")

    }

    // emove items from local storage
    const remove_from_cart_handle =(delItem)=>{
        let items_ = JSON.parse(localStorage.getItem("myItems")) || [];
    
        let updatedItems = items_.filter(item => item._id !== delItem);
        localStorage.setItem("myItems", JSON.stringify(updatedItems));
        window.location.reload()
      }

    return (
        <div className="cart_page_frame min-h-[100vh] w-full bg-gray-100 flex flex-col">

            {/* navbar */}
            <div className="Navbar_frame fixed top:0 left-0 z-50">
                <Navbar_frame />
            </div>

            {/* --------------------> basic features div */}
                <div className="website_features_div">
                    <Website_features />
                </div>


            {/*  */}
            <div className="flex flex-col md:flex-row justify-between p-4 gap-2 mt-[10vw]">


                {/* Left Section - Cart Items */}
                <div className="w-full md:w-2/3">
                    {cartItems.length === 0 ? (
                        <p className="text-center text-gray-500">Your cart is empty.</p>
                    ) : (
                        // cartItems.map((item) => (
                        //     <div key={item.id} className="bg-gray-100 p-4 mb-4 border-1 border-gray-400 rounded-[2vw] shadow-2xl">
                        //         <CartProductTemp name={item.name} style={item.style} size={item.size} price={item.price} qty={item.qty} />

                        //     </div>
                        // ))
                        cartItems.map((item) => (
                     <div key={item._id} className="bg-gray-100 p-4 mb-4 border-1 border-gray-400 rounded-[2vw] shadow-2xl">

                                      <div className="flex items-center justify-between mt-4">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-24 h-24 object-contain"
                                        />
                                        <div className="flex flex-col ml-4">
                                          <span className="font-bold">{item.name}</span>
                                          {/* <span>STYLE#: {item.style}</span> */}
                                          {/* <span>SIZE: {item.size}</span> */}
                                          {/* <span>QTY: {item.qty} @ ₹{item.price.toFixed(2)}</span> */}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <button onClick={() => decrementQty(item._id)} className="p-2 bg-gray-200 rounded">
                                            <AiOutlineMinus />
                                          </button>
                                          <span>{item.quantity}</span>
                                          <button onClick={() => incrementQty(item._id)} className="p-2 bg-gray-200 rounded">
                                            <AiOutlinePlus />
                                          </button>
                                        </div>
                                        <button onClick={() => {remove_from_cart_handle(item._id)}} className="p-2 bg-blue-500 text-white rounded">
                                          <AiOutlineDelete />
                                        </button>
                                      </div>
                                      <a href="#" className="text-blue-500 mt-4">Add gift options</a>
                                </div>
                        ))
                        
                    )}
                </div>

                {/* Right Section - Summary */}
                <div className="w-full md:w-1/3 bg-gray-100 p-4 shadow-2xl rounded-2xl border-1">
                    <h2 className="text-xl font-bold">SUMMARY</h2>
                    <div className="mt-4">
                        <label className="block text-gray-700">DO YOU HAVE A PROMO CODE?</label>
                        <div className="flex mt-2">
                            <input type="text" className="border border-gray-300 p-2 w-full" />
                            <button className="bg-orange-500 text-white px-4 py-2 ml-2">APPLY</button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>£{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span>Estimated Delivery & Handling</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span>Total</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button onClick={()=>{checkOutHandle()}} className="bg-orange-500 text-white w-full py-2 mt-4">CHECKOUT</button>
                    <div className="text-center mt-4">OR</div>
                    <button className="bg-blue-500 text-white w-full py-2 mt-4">Check out with PayPal</button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
