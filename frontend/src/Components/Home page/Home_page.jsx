import React from 'react'
import "./Home_page.css"
import Navbar_frame from '../Common frames/Navbar_frame'
import HomePage_1 from './HomePage_1'
import Home_page_2 from './Home_page_2'
import Footer_frame from '../Common frames/Footer_frame'
import Offers_frame from '../Common frames/Offers_frame'

const Home_page = () => {
    return (
        <div className='home_page_frame bg-red-500'>

            <div className="home_page_cont bg-gray-100  md:w-full">
                {/* ----------------------> navbarframe */}
                <div className="Navbar_frame fixed top:0 left-0 z-50">
                    <Navbar_frame />
                </div>
                {/* ---------------------->  Home page main frame */}
                <div className="Home_page_main_frame z-30 bg-gray-100">
                    {/* Homepage 1 */}
                    <div className="w-full h-[50vh] flex flex-row md:h-[90vh] ">
                        <HomePage_1 />
                    </div>

                    {/* ----------------------> get offers frame */}
                    <div className="home_page_offers_frame h-[20vh] mt-20 md:flex flex-col justify-center items-center bg-gray-100 md:h-[30vh]">
                        <Offers_frame/>
                    </div>

                    {/* ---------------> other offers frame */}

                    {/* home page 2 */}
                    <div className="w-full min-h-[100vh]  py-[2vw] md:min-h-[100vh]">
                        <Home_page_2 />
                    </div>


                </div>

            </div>
            {/* -------------------> footer frame */}
            <div className="footer_frame_">
                <Footer_frame />
            </div>

        </div>
    )
}

export default Home_page
