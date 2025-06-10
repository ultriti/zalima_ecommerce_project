import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { Query } from "mongoose";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const PayPalPayment = () => {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();

    const [shippingAddress_, setshippingAddress] = useState({})
    const [taxPrice, settaxPrice] = useState(109)
    const [shippingPrice, setshippingPrice] = useState(120)
    const [totalPrice, setTotalPrice] = useState(taxPrice + shippingPrice)
    const [orderItems, setorderItems] = useState([])

    // Fetch order details from orders
    const order_details = ()=>{
        const shippingAdd = localStorage.getItem('selectedOrder')? JSON.parse(localStorage.getItem('selectedOrder')) : {}
        setshippingAddress(shippingAdd)
        const orderItems_ = JSON.parse(localStorage.getItem('myItems'))? JSON.parse(localStorage.getItem('myItems')) : []
        setorderItems(orderItems_)
    }

    const amount = searchParams.get('amount');
    console.log('--->', amount);

    const amount_ = {
        value: amount
    }

    const addOrderFuntion = async (orderDetails) => {
        await axios.post(`${import.meta.env.VITE_BASE_URI}/api/orders`, orderDetails, { withcredentials: true });
        localStorage.removeItem('selectedOrder');
        localStorage.removeItem('myItems');
        toast.success("Order placed successfully!");
        nav("/user/order")
    }


    const paymnt_method_fun = async () => {

        // Payment logic here
        const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/payment/paypal_`, amount_, { withcredentials: true });
        console.log("Payment Response: ", response.data.redirect_url);
        window.location.href = response.data.redirect_url

        const params = new URLSearchParams(window.location.search);
        const orderID = params.get("orderID");

        if (orderID) {
            console.log("Captured Order ID:", orderID);
            const orderDetails = {
                orderItems:orderItems,
                shippingAddress:shippingAddress_,
                paymentMethod: "PayPal",
                itemsPrice:amount,
                taxPrice:taxPrice,
                shippingPrice:shippingPrice,
                totalPrice:totalPrice,
            };

            // Send to backend for verification
            await axios.get(`${import.meta.env.VITE_BASE_URI}/api/payment/webhook/paypal/${orderID}`)
                .then(response => {
                    if (response.data.status === "COMPLETED") {
                        console.log("Payment successful!");
                        alert("Your payment was completed!");
                        addOrderFuntion(orderDetails);


                    } else {
                        console.log("Payment not completed.");
                        alert("Payment failed or pending.");
                    }
                })
                .catch(error => console.error("Error verifying payment:", error));
        }

    }

    useEffect(() => {
        paymnt_method_fun()
    }, []);


    return (
        <>

            <div className="flex justify-center items-center h-screen">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
            </div>

        </>
    );
};

export default PayPalPayment;
