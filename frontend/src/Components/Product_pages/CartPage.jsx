import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import Navbar_frame from '../Common frames/Navbar_frame';

const CartPage = () => {
    const nav = useNavigate();

    const initialItems = JSON.parse(localStorage.getItem("myItems")) || [];
    const [cartItems, setCartItems] = useState(
        initialItems.map(item => ({ ...item, quantity: 1 }))
    );

    const [subtotal, setSubtotal] = useState(
        initialItems.reduce((acc, item) => acc + item.price * 1, 0)
    );


    const [paymentCharges, setPaymentCharges] = useState({
        shippingCharges: 0,
        handlingCharges: 13,
        productAmount: subtotal,
        deliveryCharges: 0,
        taxCharges: 0,
    });


    console.log('totla ammount ->');




    const updateSummary = (updatedCart) => {
        const newSubtotal = updatedCart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setSubtotal(newSubtotal);
        setPaymentCharges(prev => ({
            ...prev,
            productAmount: newSubtotal
        }));
    };

    const incrementQty = (id) => {
        const updated = cartItems.map(item =>
            item._id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updated);
        updateSummary(updated);
    };

    const decrementQty = (id) => {
        const updated = cartItems.map(item =>
            item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        );
        setCartItems(updated);
        updateSummary(updated);
    };

    const removeFromCart = (id) => {
        const updated = cartItems.filter(item => item._id !== id);
        localStorage.setItem("myItems", JSON.stringify(updated));
        setCartItems(updated);
        updateSummary(updated);
    };

    // 🔥 Save order with correct schema
    const handlePlaceOrder = () => {
        if (cartItems.length === 0) return;

        const total = paymentCharges.shippingCharges + paymentCharges.handlingCharges + subtotal + paymentCharges.deliveryCharges + paymentCharges.taxCharges
        console.log('totla ammount ->', total);


        const orderDetails = {
            items: cartItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.image,
                price: item.price,
                product: item._id,
                vendor: item.vendor
            })),
            summary: {
                productAmount: paymentCharges.productAmount,
                shippingCharges: paymentCharges.shippingCharges,
                handlingCharges: paymentCharges.handlingCharges,
                deliveryCharges: paymentCharges.deliveryCharges,
                taxCharges: paymentCharges.taxCharges,
                totalAmount: total
            },
            orderedAt: new Date().toISOString()
        };

        localStorage.setItem("orderedItems", JSON.stringify(orderDetails));
        nav(`/user/payment_conform?amount=${paymentCharges.productAmount}`);
    };

    return (
        <div className="cart_page_frame min-h-[100vh] w-full bg-gray-100 flex flex-col">
            <div className="Navbar_frame fixed top-0 left-0 z-50">
                <Navbar_frame />
            </div>

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
                                    <button onClick={() => removeFromCart(item._id)} className="p-2 bg-blue-500 text-white rounded">
                                        <AiOutlineDelete />
                                    </button>
                                </div>
                                <a href="#" className="text-blue-500 mt-4">Add gift options</a>
                            </div>
                        ))
                    )}
                </div>

                <div className="w-full md:w-1/3 bg-gray-100 p-4 shadow-2xl rounded-2xl border-1">
                    <h2 className="text-xl font-bold">SUMMARY</h2>
                    <div className="mt-4 flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{paymentCharges.productAmount}</span>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        className="bg-orange-500 cursor-pointer text-white w-full py-2 mt-4"
                    >
                        Select your address
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
