import React from 'react'
import "../Common routes/Navbar_frame.css"

const Navbar_frame = () => {


  return (
    <div className='navbar_frame min-h-[4vw] w-full flex flex-col px-[2vw] py-1 z-50 items-center bg-blue-500 justify-center md:flex-row md:justify-between md:items-center md:py-0 md:y-0 md:h-4 '>
      <div className='navbar_frame_left flex items-center justify-center '>
        <img
          src="/path/to/logo.png"
          alt="ultriti logo"
          className="h-8"
        />
      </div>
      <div className='navbar_frame_right flex flex-row gap-[5vw] text-[5vw] font-[700] capitalize md:text-[1.4vw] md:gap-[2vw] md:items-center md:py-0'>
        <a href="/"><h1>home</h1></a>
        <h1>About us</h1>
        <a href="/register"><h1>Signup</h1></a>
      </div>
    </div>
  )
}


export default Navbar_frame
