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

    return (
        <div className='home_page_2_frame w-full flex felx-col  bg-gray-100'>
            <div className="homepage_2_container px-[1vw] ">

                <div className="hp_2_swipper_frame  h-[69vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center justify-between rounded-[10px] w-[99%] px-5">
                    <p className='text-black-500 font-bold text-[3.5vw] uppercase md:text-[1.5vw]'>mens</p>
                    <p className="font-bold text-blue-500 pointer "><a href="/product/allProducts">see more</a></p>
                </div>
                    <Homepage2_templates category={'men'} />
                </div>

                <div className="hp_2_swipper_frame  h-[69vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center justify-between rounded-[10px] w-[99%] px-5">
                    <p className='text-black-500 font-bold text-[3.5vw] uppercase md:text-[1.5vw]'>womens</p>
                    <p className="font-bold text-blue-500 pointer "><a href="/product/allProducts">see more</a></p>
                </div>
                    <Homepage2_templates category={'women'} />
                </div>
                
                <div className="hp_2_swipper_frame  h-[69vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center justify-between rounded-[10px] w-[99%] px-5">
                    <p className='text-black-500 font-bold text-[3.5vw] uppercase md:text-[1.5vw]'>girls</p>
                    <p className="font-bold text-blue-500 pointer "><a href="/product/allProducts">see more</a></p>
                </div>
                    <Homepage2_templates category={'girl'} />
                </div>

                <div className="hp_2_swipper_frame  h-[69vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center justify-between rounded-[10px] w-[99%] px-5">
                    <p className='text-black-500 font-bold text-[3.5vw] uppercase md:text-[1.5vw]'>boys</p>
                    <p className="font-bold text-blue-500 pointer "><a href="/product/allProducts">see more</a></p>
                </div>
                    <Homepage2_templates category={'boy'} />
                </div>
                <div className="hp_2_swipper_frame  h-[69vh] my-[3vw] w-full rounded-[2vw] shadow-lg">
                <div className="bg-gray-200 hp_2_swipper_title h-[6vh] m-1 flex items-center justify-between rounded-[10px] w-[99%] px-5">
                    <p className='text-black-500 font-bold text-[3.5vw] uppercase md:text-[1.5vw]'>Wedding </p>
                    <p className="font-bold text-blue-500 pointer "><a href="/product/allProducts">see more</a></p>
                </div>
                    <Homepage2_templates category={'Wedding'} />
                </div>
            
            </div>

        </div>
    )
}

export default Home_page_2
