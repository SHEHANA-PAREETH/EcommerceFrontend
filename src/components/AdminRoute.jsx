import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Login from '../pages/common/Login'

function AdminRoute() {
    const {userInfo} = useSelector((state)=> state.auth)
  return (
    userInfo && userInfo.isAdmin ? <Outlet/>:<Login/>
  )
}

export default AdminRoute