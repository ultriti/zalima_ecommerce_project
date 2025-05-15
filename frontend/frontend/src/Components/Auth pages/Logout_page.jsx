
import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const Logout_page = () => {

    const logout_funtion = async() => {
        console.log("Logout");
        
        try {
            const logout_page = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/users/logout`, { withCredentials: true })
            
            if(logout_page.status == 200){
                toast.success(logout_page.data.message);
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                window.location.href = "/"
            }
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    }
    logout_funtion()
   
  return (

    <div>

      
    </div>
  )
}

export default Logout_page
