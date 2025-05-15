import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { Query } from "mongoose";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const PayPalPayment = () => {
    const [searchParams] = useSearchParams();

    const amount = searchParams.get('amount');
    console.log('--->', amount);

    const amount_ = {
        value: amount
    }



    const paymnt_method_fun = async () => {

        // Payment logic here
        const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/payment/paypal_`, amount_, { withcredentials: true });
        console.log("Payment Response: ", response.data.redirect_url);
        window.location.href = response.data.redirect_url
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
