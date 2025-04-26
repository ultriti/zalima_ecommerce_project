import React,{useEffect,useContext,useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const UserProtectedWrapper = ({children}) => {

  const [auth_user_boolen, setAuth_userBoolen] = useState(false);
  

    const token = localStorage.getItem('token');
    // const user_auth_ = localStorage.getItem('user_auth');

    
    const navigate = useNavigate();


     useEffect(() => {
        if (token) {
        // if (true) {

          setAuth_userBoolen(true);
          // alert('You can axcess to user page');
        } else {
          setAuth_userBoolen(false);
          toast.error('You need to login first');
          navigate('/user/register');
        }
      }, [token]);

       
      return auth_user_boolen ? <>{children}</> : null;

}

export default UserProtectedWrapper
