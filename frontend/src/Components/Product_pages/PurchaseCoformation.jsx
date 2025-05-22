import React, { useEffect, useState } from 'react'
import Navbar_frame from '../Common frames/Navbar_frame'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PurchaseCoformation = () => {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const [ammount_, setammount_] = useState('')


  const [select_address, setselect_address] = useState([])
  const [getselectedOrder, setgetselectedOrder] = useState({})
  const [selectedHover, setselectedHover] = useState(false)



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
    setgetselectedOrder(shippingAddress_data);
    console.log('-->', shippingAddress_data);
    setselectedHover(true)
    localStorage.setItem('selectedOrder', JSON.stringify(shippingAddress_data));
  };

  const getSelectedOrderClass = (address) => {
    return address === getselectedOrder ? 'h-[40vh] w-[20vw] bg-gradient-to-br from-blue-500 to-blue-800 text-white shadow-lg rounded-xl p-6 border-4 border-green-500 shadow-lg' : 'h-[40vh] w-[20vw] bg-gradient-to-br from-blue-500 to-blue-800 text-white shadow-lg rounded-xl p-6';
  };

  return (
    <div className='min-h-[100vh] w-full flex flex-row'>

      <div className="Navbar_frame fixed top-0 left-0 z-50">
        <Navbar_frame />
      </div>

      <div className="h-full w-full flex flex-row md:flex-row justify-between p-4 gap-2 mt-[6vw]">
        <div className="h-[100vh] w-[60%] shadow-2xl">
          {
            select_address.map((address, index) => (

              <div key={index} onClick={() => handleOrderSelect(address)} className={getSelectedOrderClass(address)}>
                <h2 className="text-2xl font-bold mb-4 text-center">Address Details</h2>
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between border-b border-white pb-2">
                    <span className="font-semibold">Name:</span>
                    <span>{address.name}</span>
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

        <div className="h-[50vh] py-20 px-10 w-[40%] border-2">
            <h2 className="text-xl font-bold">SUMMARY</h2>
            <div className="mt-4 flex justify-between">
              <span>Subtotal</span>
              <span>₹{ammount_}</span>
            </div>
            <button onClick={() => nav(`/user/paypal?amount=${ammount_}`)} className="bg-orange-500 text-white w-full py-2 mt-4">
              CHECKOUT
            </button>
          </div>


      </div>

    </div>
  )
}

export default PurchaseCoformation