
import React from 'react'
import axios from 'axios'

const Logout_page = () => {

    const logout_funtion =async() =>{
        console.log("Logout");
        
        const logout_page =await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/logout`, { withCredentials: true })

        
        if(logout_page.status == 200){
            alert(logout_page.data.message)
            localStorage.removeItem('token');
            window.location.href = "/"
        }
    }
    logout_funtion()
   
  return (

    <div>

      
    </div>
  )
}

export default Logout_page
