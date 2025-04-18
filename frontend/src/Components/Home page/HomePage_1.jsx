import React from 'react'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import gsap from 'gsap';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import "./Homepage_1.css"

const HomePage_1 = (props) => {
    const handleMouseEnter = (e) => {
        // alert(e) 
        gsap.to(`.${e}`, {
            duration: 0.1,
            display: "flex",
        });
    }

    const handleMouseleave = (e) => {
        // alert(e)
        gsap.to(`.${e}`, {
            duration: 0.1,
            display: "none"
        });
    }

    const products = [
  {
    name: "Yashash",
    price: "₹ 1000",
    rating: 5,
    reviews: 19,
    features: [
      "10g of Lactose Free Whey Protein",
      "5g of Healthy Fats",
      "1g of Carb",
      "Sweetened by Monk Fruit",
      "No Cane Sugar, Sugar Alcohols, or Sugar Substitutes",
      "200mg of caffeine - all day energy without the crash",
    ],
    shipping: "Shipping will be calculated at checkout",
  },
];

    const items = [{
        name: "yashash",
        image: "https://th.bing.com/th/id/OIP.smNlaoecWLhAIOOHMxFxcQHaEK?rs=1&pid=ImgDetMain",
        price: "₹ 1000"
    },
    {
        name: "ravi",
        image: "https://th.bing.com/th/id/OIP.jtS23CrdNk0SdkIahKlOqwHaEo?rs=1&pid=ImgDetMain",
        price: "₹ 2000"
    },
    {
        name: "pop",
        image: "https://th.bing.com/th/id/OIP.pTA1vpUuuMqsK9QP261euAHaEK?rs=1&pid=ImgDetMain",
        price: "₹ 3000"

    },

    ]


    return (
        <div className='home_page_1_frame z-30 mt-10 rounded-[2vw] overflow-hidden md:p-[1vw] md:mt-0'>
            <Swiper
                // install Swiper modules
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{ vertical: true }}
                pagination={{ clickable: true }}
                scrollbar={{ draggable: true }}
                onSwiper={(swiper) => { gsap.to(swiper, { scale: 1.2 }) }}
                onSlideChange={() => console.log('slide change')}
                loop={true}
                className='swiper_ rounded-[2vw] overflow-hidden '

            >
                {
                    items.map((item, index) => (
                        <SwiperSlide className={`swiper_slider_cln   flex flex-col justify-center items-center bg-cover ounded-[2vw] overflow-hidden`} key={index} onMouseEnter={() => { handleMouseEnter(`product_hp1_overlay_${index}`) }} onMouseLeave={() => { handleMouseleave(`product_hp1_overlay_${index}`) }}>
                            <div className="home_p_products_card_ rounded-[20px] overflow-hidden" >
                                <img src={item.image} alt="" className='w-full h-full bg-cover ' />

                                {/* overlay frame */}
                                <div className={`product_hp1_overlay_div product_hp1_overlay_${index}`} >
                                    <div className="product_hp1_overlay_div_text text-amber-50 flex flex-col items-center justify-end">
                                        {/* overlay div  */}
                                        <h2 className="text-2xl font-bold text-amber-50 mb-2">{item.name}</h2>
                                        <div className="flex items-center mb-4">
                                            <span className="text-yellow-500 text-lg">★★★★★</span>
                                            <span className="ml-2 text-gray-600">{item.reviews}</span>
                                        </div>
                                        <ul className="list-disc list-inside mb-4">
                                            <li>10g of Lactose Free Whey Protein</li>
                                            <li>5g of Healthy Fats</li>
                                            <li>1g of Carb</li>
                                            <li>Sweetened by Monk Fruit</li>
                                            <li>No Cane Sugar, Sugar Alcohols, or Sugar Substitutes</li>
                                            <li>200mg of caffeine - all day energy without the crash</li>
                                        </ul>
                                        <div className="text-2xl font-bold mb-2">{item.price}</div>
                                        <div className="text-gray-600">Shipping will be calculated at checkout</div>
                                    </div>
                                </div>

                            </div>


                        </SwiperSlide>
                    ))

                }


            </Swiper>

        </div>
    )
}

export default HomePage_1
