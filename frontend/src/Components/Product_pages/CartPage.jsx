import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';

import CartProductTemp from './CartProductTemp';
import Navbar_frame from '../Common frames/Navbar_frame';
import Website_features from '../Common frames/Website_features';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const nav = useNavigate();
    
    // Retrieve items and set initial quantity to 1
    const cart_items = JSON.parse(localStorage.getItem("myItems")) || [];
    const [cartItems, setCartItems] = useState(
        cart_items.map(item => ({ ...item, quantity: 1 }))
    );

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

    // Remove items from local storage and state
    const remove_from_cart_handle = (delItem) => {
        let updatedItems = cartItems.filter(item => item._id !== delItem);
        localStorage.setItem("myItems", JSON.stringify(updatedItems));
        setCartItems(updatedItems);
    };

    // Calculate subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="cart_page_frame min-h-[100vh] w-full bg-gray-100 flex flex-col">
            {/* Navbar */}
            <div className="Navbar_frame fixed top-0 left-0 z-50">
                <Navbar_frame />
            </div>

            {/* Features */}
            <div className="website_features_div">
                <Website_features />
            </div>

            {/* Cart Items */}
            <div className="flex flex-col md:flex-row justify-between p-4 gap-2 mt-[10vw]">
                <div className="w-full md:w-2/3">
                    {cartItems.length === 0 ? (
                        <p className="text-center text-gray-500">Your cart is empty.</p>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item._id} className="bg-gray-100 p-4 mb-4 border-1 border-gray-400 rounded-[2vw] shadow-2xl">
                                <div className="flex items-center justify-between mt-4">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-contain" />
                                    <div className="flex flex-col ml-4">
                                        <span className="font-bold">{item.name}</span>
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
                                    <button onClick={() => remove_from_cart_handle(item._id)} className="p-2 bg-blue-500 text-white rounded">
                                        <AiOutlineDelete />
                                    </button>
                                </div>
                                <a href="#" className="text-blue-500 mt-4">Add gift options</a>
                            </div>
                        ))
                    )}
                </div>

                {/* Summary */}
                <div className="w-full md:w-1/3 bg-gray-100 p-4 shadow-2xl rounded-2xl border-1">
                    <h2 className="text-xl font-bold">SUMMARY</h2>
                    <div className="mt-4 flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <button onClick={() => nav(`/user/paypal?amount=${subtotal.toFixed(2)}`)} className="bg-orange-500 text-white w-full py-2 mt-4">
                        CHECKOUT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
