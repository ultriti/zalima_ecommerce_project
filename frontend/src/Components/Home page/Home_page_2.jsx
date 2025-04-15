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
import Homepage2_templates from './Homepage2_templates';


const Home_page_2 = () => {

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
        <div className='home_page_2_frame w-full flex felx-col  bg-gray-100'>
            <div className="homepage_2_container px-[1vw] ">

                <div className="hp_2_swipper_frame  h-[59vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center rounded-[10px] w-[99%] px-3">
                    <p className='text-black-500 font-bold text-[1.5vw] uppercase'>mens</p>
                </div>
                    <Homepage2_templates />
                </div>

                <div className="hp_2_swipper_frame  h-[59vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center  rounded-[10px] w-[99%] px-3">
                    <p className='text-black-500 font-bold text-[1.5vw] uppercase'>womens</p>
                </div>
                    <Homepage2_templates />
                </div>
                
                <div className="hp_2_swipper_frame  h-[59vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-3 flex items-center  rounded-[10px] w-[99%] px-3">
                    <p className='text-black-500 font-bold text-[1.5vw] uppercase'>electronics</p>
                </div>
                    <Homepage2_templates />
                </div>

                <div className="hp_2_swipper_frame  h-[59vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center  rounded-[10px] w-[99%] px-3">
                    <p className='text-black-500 font-bold text-[1.5vw] uppercase'>cloths</p>
                </div>
                    <Homepage2_templates />
                </div>
            
            </div>

        </div>
    )
}

export default Home_page_2
