import React, { useState } from "react";
import Navbar_frame from "../Common_frames/Navbar_frame";

const paymentMethods = [
    { id: 1, name: "Credit/Debit Card", icon: "💳" },
    { id: 2, name: "googlePay", icon: "🛜" },
    { id: 2, name: "PhonePay", icon: "🛜" },
    { id: 2, name: "PayPal", icon: "🛜" },
    { id: 3, name: "Pay in 3 with PayPal", icon: "📱" },
    { id: 4, name: "Pay Later with Klarna", icon: "⏳" },
    { id: 5, name: "Pay in 3 with Klarna", icon: "🔄" },
    { id: 6, name: "Clearpay", icon: "🏦" },
    { id: 6, name: "other Upi", icon: "📱" },
];

const PaymentListPage = () => {
    const [selectedPayment, setSelectedPayment] = useState(null);

    return (
        <div className="payment_page_frame min-h-[100vh] w-full bg-gray-100 flex flex-col">

            {/* navbar */}
            <div className="Navbar_frame fixed top:0 left-0 z-50">
                <Navbar_frame />
            </div>
            <div className="flex flex-col md:flex-col justify-between gap-2 mt-[5vw] px-[10vw]">

                <h2 className="text-xl font-bold mb-4">Select a Payment Method</h2>
                <div className="space-y-4">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedPayment(method.name)}
                            className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-100 ${selectedPayment === method.name ? "bg-blue-100" : ""
                                }`}
                        >
                            <span className="text-lg">{method.icon}</span>
                            <span className="font-medium">{method.name}</span>
                        </button>
                    ))}
                </div>
                {selectedPayment && (
                    <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                        Selected Payment: <strong>{selectedPayment}</strong>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentListPage;
