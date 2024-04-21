import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Home from '../pages/user/Home'
import Login from '../pages/common/Login'
function LoginRoute() {
    const {userInfo} = useSelector((state)=> state.auth)
  return (
    userInfo ? <Home/>: <Outlet/>
  )
}

export default LoginRoute


