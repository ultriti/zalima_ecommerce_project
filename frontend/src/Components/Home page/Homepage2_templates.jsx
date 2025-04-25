import React, { useState } from 'react'
import "./Home_page_2.css"

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import gsap from 'gsap';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import ProductCard from '../Product_pages/ProductCard';
import items_ from "../Product_pages/products.json"

const Homepage2_templates = (props) => {
    const [items, setitems] = useState([...items_])

    return (
        <div className='p-[0.5vw] h-[60vh] w-full  rounded-[2vw] overflow-hidden'>
            <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={10}
                slidesPerView={5}
                navigation={{ vertical: true }}
                onSwiper={(swiper) => { gsap.to(swiper, { scale: 1.2 }) }}
                loop={true}
                className='swiper_  '
                breakpoints={{
                    0: {
                        slidesPerView: 1, // For all widths >= 0px
                    },
                    700: {
                        slidesPerView: 5, // For widths >= 700px
                    }
                }}

            >
         
                {
                    items
                        .filter((item) => item.category === `${props.category}`) // Filter items by category "men"
                        .map((filteredItem, index) => (
                            <SwiperSlide className='swiper_slider_cln' key={index}>
                                <a href={`/product/productsTemp/${filteredItem._id}`} className='relative h-full w-full'>
                                    <div className="home_p_products_card_ bg-red-400 rounded-[20px]">
                                        <ProductCard
                                            name={filteredItem.name}
                                            product_img={filteredItem.image}
                                            price={filteredItem.price}
                                            offer={filteredItem.offer}
                                        />
                                    </div>
                                </a>
                            </SwiperSlide>
                        ))
                    }

            </Swiper>

        </div>
    )
}

export default Homepage2_templates
