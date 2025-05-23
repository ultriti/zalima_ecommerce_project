import React, { useState } from 'react'
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';

const CartProductTemp = (props) => {
    const [cartItems, setCartItems] = useState([
            {
                id: 1,
                name: "Nike Air Max 90 ID Men's Shoes",
                style: "554353-981",
                size: "US/MEN 11.5",
                qty: 1,
                price: 150.0,
            },
            {
                id: 2,
                name: "Nike Air Max 90 Premium ID Men's Shoes",
                style: "708773-934",
                size: "US/MEN 12",
                qty: 1,
                price: 164.97,
            },
        ]);
    const incrementQty = (id) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, qty: item.qty + 1 } : item
        ));
    };

    // Function to decrease quantity
    const decrementQty = (id) => {
        setCartItems(cartItems.map(item =>
            item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
        ));
    };

    // Function to remove item
    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };
  return (
    <div className='h-full m-full  p-3'>
        <h2 className="text-xl font-bold">YOUR CART</h2>
              <div className="flex items-center justify-between mt-4">
                <img
                  src="https://via.placeholder.com/150"
                  alt={props.name}
                  className="w-24 h-24"
                />
                <div className="flex flex-col ml-4">
                  <span className="font-bold">{props.name}</span>
                  <span>STYLE#: {props.style}</span>
                  <span>SIZE: {props.size}</span>
                  <span>QTY: {props.qty} @ ₹{props.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => decrementQty(props.id)} className="p-2 bg-gray-200 rounded">
                    <AiOutlineMinus />
                  </button>
                  <span>{props.qty}</span>
                  <button onClick={() => incrementQty(props.id)} className="p-2 bg-gray-200 rounded">
                    <AiOutlinePlus />
                  </button>
                </div>
                <button onClick={() => removeItem(props.id)} className="p-2 bg-blue-500 text-white rounded">
                  <AiOutlineDelete />
                </button>
              </div>
              <a href="#" className="text-blue-500 mt-4">Add gift options</a>
      
    </div>
  )
}

export default CartProductTemp
