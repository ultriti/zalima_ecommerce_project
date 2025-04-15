import React from 'react'

const Navbar_frame = () => {
  return (
    <div className='navbar_frame h-full w-full flex flex-row px-[2vw] z-50 items-center bg-blue-500 justify-between'>
        <div className='navbar_frame_left'>
            <h1>Logo</h1>
        </div>
        <div className='navbar_frame_right flex flex-row gap-[2vw]'>
            <a href="/Home"><h1>home</h1></a>
            <h1>About us</h1>
            <a href="/register"><h1>Signup</h1></a>
        </div>
      
    </div>
  )
}

export default Navbar_frame
