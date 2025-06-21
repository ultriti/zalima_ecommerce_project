import React, { useEffect, useState } from 'react'
import Navbar_frame from '../Common frames/Navbar_frame'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PurchaseConformation = () => {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const [ammount_, setammount_] = useState('')


  const [select_address, setselect_address] = useState([])
  const [getselectedOrder, setgetselectedOrder] = useState({})
  const [selectedHover, setselectedHover] = useState(false)
  const [selectPaymentMethodbol, setselectPaymentMethodbol] = useState(false)
  const [selectPayment, setselectPayment] = useState({})

  const [OrderedProducts, setOrderedProducts] = useState([])
  const [totalOrderDetails, settotalOrderDetails] = useState([])

  const getOrderedItems = () => {
    const OrderedItem = localStorage.getItem("orderedItems");
    console.log('--> ordered items', JSON.parse(OrderedItem));

    setOrderedProducts(JSON.parse(OrderedItem))


  }
  useEffect(() => {
    getOrderedItems()
  }, [])


  const payment_method = [
    {
      method_name: "UPI",
      description: "get by paypal app"
    },
    {
      method_name: "Credit/ Debit /ATM-card",
      description: 'pay with secure cards'
    },
    {
      method_name: "cash on delivery",
      description: ""
    },
    {
      method_name: 'EMI',
      description: 'pay in installments'
    }
  ]

  const getUserAddresses = async () => {

    const amount = searchParams.get('amount');
    console.log('--->', amount);
    setammount_(amount)

    const amount_ = {
      value: amount
    }


    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/users/profile`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        console.log('-->', res.data.shippingAddresses);
        setselect_address(res.data.shippingAddresses);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  useEffect(() => {
    getUserAddresses()
  }, [])

  const handleOrderSelect = (shippingAddress_data) => {
    setselectedHover(!selectedHover)
    setgetselectedOrder(shippingAddress_data);
    console.log('-->', shippingAddress_data);

  };
  const getPaymentMethodClass = (method) => {
    return method.method_name === selectPayment.method_name ? 'h-[10vh] w-[15vw] shadow-2xs border-1 border-gray-500 cursor-pointer text-center flex flex-col p-2 item-center rounded-2xl bg-gradient-to-br from-gray-200 to-gray-400 text-white font-bold border-4 border-blue-900' : 'h-[10vh] w-[15vw] shadow-2xs border-1 border-gray-300 cursor-pointer text-center flex flex-col p-2 item-center rounded-2xl bg-gradient-to-br from-gray-200 to-gray-200 text-white';
  };

  const getSelectedOrderClass = (address) => {
    return address === getselectedOrder ? 'h-[40vh] min-w-[100%] bg-gradient-to-br from-blue-500 to-blue-800 text-white rounded-xl p-6 border-4 border-blue-900 shadow-lg' : 'h-[40vh] min-w-[100%] bg-gradient-to-br from-blue-500 to-blue-800 text-white shadow-lg rounded-xl p-6';
  };
  const handlePaymentMethodSelect = (paymentMethodId) => {
    setselectPayment(paymentMethodId);
  };
  console.log('=>getselectedAddress', getselectedOrder);

  const paymentFuntion = async () => {

    const orderDetails = {
      address: getselectedOrder,
      payment_method: selectPayment.method_name,
      amount: ammount_
    }

    if (selectPayment.method_name === 'UPI') {
      nav(`/user/paypal?amount=${ammount_}`)
    }
    else if (selectPayment.method_name === 'cash on delivery') {

      console.log('=>OrderedProducts :', OrderedProducts);
      const orderD = []

      {
        OrderedProducts.items.map(async (order, i) => {
          console.log('-> maping', order);

          const orderItem = {
            name: order.name,
            qty: order.qty,
            image: order.image,
            price: order.price,
            product: '68553b37d849545a4b3c4ca0'
          }

          orderD.push(orderItem)


        })
      }

      const orderDetails = {

        orderItems: orderD,
        shippingAddress: getselectedOrder,
        paymentMethod: selectPayment.method_name,
        itemsPrice: OrderedProducts.summary.productAmount,
        taxPrice: OrderedProducts.summary.taxCharges,
        shippingPrice: OrderedProducts.summary.shippingCharges,
        totalPrice: OrderedProducts.summary.totalAmount,
      }

      console.log("----------------------------------------------------------\n", orderDetails)
      settotalOrderDetails(prevArray => [...prevArray, orderDetails])

      const createOrderAxios = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/orders/`, orderDetails, { withCredentials: true });
      console.log('--> status : ', createOrderAxios);



      if (createOrderAxios.status === 201) {
        alert(createOrderAxios.data.message)
        localStorage.removeItem("orderedItems")
        localStorage.removeItem("myItems")
        localStorage.removeItem("selectedOrder")

        nav("/user/orders");

      } else {
        alert(createOrderAxios.data.message)
      }
    } else if (selectPayment.method_name === 'EMI') {

    } else {
      alert('Please select payment method')
    }

  }

  return (
    <div className='min-h-[100vh] w-full flex flex-row'>

      <div className="Navbar_frame fixed top-0 left-0 z-50">
        <Navbar_frame />
      </div>

      <div className="h-full w-full flex flex-row md:flex-row justify-between p-4 gap-2 mt-[6vw]">
        <div className="h-[100vh] w-[60%] shadow-2xl rounded-2xl flex flex-col border border-gray-600 p-10 gap-15">

          {
            select_address.map((address, index) => (

              <div key={index} onClick={() => handleOrderSelect(address)} className={getSelectedOrderClass(address)}>
                <h2 className="text-2xl font-bold mb-4 text-center">Address Details</h2>
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between border-b border-white pb-2">
                    <span className="font-semibold">address:</span>
                    <span>{address.address}</span>
                  </div>
                  <div className="flex justify-between border-b border-white pb-2">
                    <span className="font-semibold">City:</span>
                    <span>{address.city}</span>
                  </div>
                  <div className="flex justify-between border-b border-white pb-2">
                    <span className="font-semibold">Country:</span>
                    <span>{address.country}</span>
                  </div>
                  <div className="flex justify-between border-b border-white pb-2">
                    <span className="font-semibold">Postal Code:</span>
                    <span>{address.postalCode}</span>
                  </div>

                </div>
              </div>

            ))
          }
        </div>

        <div className="min-h-[50vh] py-20 px-10 w-[40%] border-2">
          <h2 className="text-xl font-bold">SUMMARY</h2>
          <div className="h-[10vh] w-full mt-4 flex justify-between border-b">
            <span>Subtotal</span>
            <span>₹{ammount_}</span>
          </div>
          <div className="payment_Method min-h-[20vh] flex flex-row flex-wrap w-full p-[1vw] gap-4">

            {
              payment_method?.map((method, index) => {
                return (
                  <div key={index} onClick={() => { setselectPayment(method) }} className={getPaymentMethodClass(method)}>
                    <p className='text-[1vw] font-bold text-gray-800'>{method.method_name}</p>
                    <p className='text-[0.8vw] font-[500] mt-4 text-gray-700'>{method.description}</p>

                  </div>
                )
              })
            }

          </div>
          <button onClick={() => { paymentFuntion() }} type='submit' className="bg-orange-500 text-white w-full py-2 mt-4">
            CHECKOUT
          </button>
        </div>


      </div>

    </div>
  )
}

export default PurchaseConformation