// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// const stripePromise = loadStripe("YOUR_STRIPE_PUBLIC_KEY");

// const CheckoutForm = () => {
//     const stripe = useStripe();
//     const elements = useElements();

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         if (!stripe || !elements) return;

//         const cardElement = elements.getElement(CardElement);
//         const { paymentIntent, error } = await stripe.createPaymentMethod({
//             type: "card",
//             card: cardElement,
//         });

//         if (error) {
//             console.error(error);
//         } else {
//             console.log("Payment Successful", paymentIntent);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <CardElement className="p-4 border rounded-md" />
//             <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
//                 Pay
//             </button>
//         </form>
//     );
// };

// const StripePayment = () => (
//     <Elements stripe={stripePromise}>
//         <CheckoutForm />
//     </Elements>
// );

// export default StripePayment;
