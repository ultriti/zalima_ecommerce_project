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
        name: "blue T-shirt ",
        image: "https://th.bing.com/th/id/OIP.5Fose9g5iUFPLbwVPalD3wHaEJ?rs=1&pid=ImgDetMain",
        price: "₹ 1000",
        desc:""
    },
    {
        name: "weddings special dress",
        image: "https://th.bing.com/th/id/OIP.KJxwImPedoIF1PoXvqx-cwHaFj?w=216&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
        price: "₹ 3000"
    },
    {
        name: "mens formal suit",
        image: "https://th.bing.com/th/id/OIP.NDRyQoc5tsUZvjS8KaylfAHaEK?w=208&h=117&c=7&r=0&o=5&dpr=1.3&pid=1.7",
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
                // onSlideChange={() => console.log('slide change')}
                loop={true}
                className='swiper_ rounded-[2vw] overflow-hidden '

            >
                {
                    items.map((item, index) => (
                        <SwiperSlide className={`swiper_slider_cln flex flex-col justify-center items-center bg-cover ounded-[2vw] overflow-hidden`} key={index} onMouseEnter={() => { handleMouseEnter(`product_hp1_overlay_${index}`) }} onMouseLeave={() => { handleMouseleave(`product_hp1_overlay_${index}`) }}>
                            <div className="home_p_products_card_ rounded-[20px] overflow-hidden" >
                                <img src={item.image} alt="" className='w-full h-full object-cover rounded-md' />

                                {/* overlay frame */}
                                <div className={`product_hp1_overlay_div product_hp1_overlay_${index} h-full w-full bg-red-400`} >
                                    <div className="product_hp1_overlay_div_text h-full w-full text-amber-50 flex flex-col items-center justify-end">
                                        {/* overlay div  */}
                                        <div className="flex flex-col h-full w-full items-center justify-center md:flex-row">
                                            {/* Product Image Section */}
                                            <div className="md:w-1/2 flex items-center justify-center p-4 rounded-lg">
                                                <img
                                                    src="https://via.placeholder.com/400"
                                                    alt="Product Image"
                                                    className="w-full h-auto object-cover rounded-md"
                                                />
                                            </div>

                                            {/* Product Details Section */}
                                            <div className="md:w-1/2 p-4">
                                                <h2 className="text-2xl font-bold text-white">{item.name}</h2>
                                                <p className="text-xl font-semibold text-gray-200 my-2">{item.price}</p>
                                                <p className="text-gray-200">
                                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
                                                    necessitatibus.
                                                </p>

                                               

                                                <div className="mt-4 flex space-x-2">
                                                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
