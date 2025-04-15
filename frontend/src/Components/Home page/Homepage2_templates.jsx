import React from 'react'
import "./Home_page_2.css"

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import gsap from 'gsap';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const Homepage2_templates = (props) => {

    const items = [{
        name: "yashash"
    },
    {
        name: "ravi"
    },
    {
        name: "pop"
    },
    {
        name: "done"
    }, {
        name: "fsdf"
    }, {
        name: "sfsdf"
    }
    ]
    return (
        <div className='p-[0.5vw] h-[50vh] w-full  rounded-[2vw] overflow-hidden'>
            <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={10}
                    slidesPerView={5}
                    navigation={{ vertical: true }}
                    onSwiper={(swiper) => { gsap.to(swiper, { scale: 1.2 }) }}
                    onSlideChange={() => console.log('slide change')}
                    loop={true}
                    className='swiper_  '

                >
{
                        items.map((item, index) => (
                            <SwiperSlide className='swiper_slider_cln' key={index}>
                                <div className="home_p_products_card_ bg-red-400 rounded-[20px]">

                                </div>
                            </SwiperSlide>
                        ))

                    }

                </Swiper>

        </div>
    )
}

export default Homepage2_templates
