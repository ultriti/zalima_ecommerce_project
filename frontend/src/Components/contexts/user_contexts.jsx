import React, { createContext,useState } from 'react'

export const userDataContext = createContext()

export const UserContext = ({children}) => {
  const [theme_toggle_bol, settheme_toggle_bol] = useState(false)

  const toggle_theme_funtion =()=>{
    settheme_toggle_bol(!theme_toggle_bol)
    console.log(theme_toggle_bol)
  }



  return (
    <div>
      <userDataContext.Provider  value={{theme_toggle_bol,toggle_theme_funtion}}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
