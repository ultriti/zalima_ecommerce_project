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
            duration:0.1,
            display:"flex",
        });
    }

    const handleMouseleave = (e) => {
        // alert(e)
        gsap.to(`.${e}`, { 
            duration:0.1,
            display:"none" 
        });
    }

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
        <div className='home_page_1_frame z-30 p-[2vw] rounded-[2vw] overflow-hidden'>
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
                className='swiper_ ounded-[2vw] overflow-hidden '

            >
                {
                    items.map((item, index) => (
                        <SwiperSlide className={`swiper_slider_cln   flex flex-col justify-center items-center bg-cover ounded-[2vw] overflow-hidden`} key={index} onMouseEnter={()=>{handleMouseEnter(`product_hp1_overlay_${index}`)}} onMouseLeave={()=>{handleMouseleave(`product_hp1_overlay_${index}`)}}>
                            <div className="home_p_products_card_ rounded-[20px] overflow-hidden" >
                                <img src={item.image} alt="" className='w-full h-full bg-cover ' />
                                <div className={`product_hp1_overlay_div product_hp1_overlay_${index}`} >
                                        <div className="product_hp1_overlay_div_text">
                                            <h4 className='text-center text-[1vw] font-bold text-cyan-500'>{item.name}</h4>
                                            <p className='text-center text-[1vw] font-bold text-cyan-500'>{item.price}</p>
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
