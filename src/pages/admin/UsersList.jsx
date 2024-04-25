import React, { useEffect, useState } from 'react'

import axios from 'axios'
import { Table } from 'react-bootstrap'
import { FaPen } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { FaCheck } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
function UsersList() {
  axios.defaults.withCredentials  = true;
  const [usersData,setUsersData] = useState([])
 const [newname,setNewName] = useState()
 const [newemail,setNewEmail] = useState()
  const [enableEditName,setEnableEditName] = useState()
  const [enableEditEmail,setEnableEditEmail] = useState()
  useEffect(()=>{
getAllUsers()
  },[])
  const getAllUsers= async()=>{
try{
const resp = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin`)
//console.log(resp.data);
setUsersData(resp.data)
}
catch(error){

}

  }
  const handleChangeName=(id)=>{
setEnableEditName(id)

    console.log(id);
    }
    
    const changeUsername=(newname,id)=>{
      setNewName(newname)
console.log(newname,id);
const updatedUsers = usersData.map((user)=> user._id === id ?{...user,username:newname}:user)
    setUsersData(updatedUsers)
    //console.log(usersData);
    setEnableEditName("")
    updateNameHandler(id)
}
    const updateNameHandler=(id)=>{
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!"
      }).then(()=>{
        axios.put(`${process.env.REACT_APP_BASE_URL}/api/admin/${id}`, {username:newname})
        .then(response => {
          // Handle success
          console.log('Updated successfully:', response.data);
        
        })
        .catch(error => {
          // Handle error
          console.error('Update failed:', error);
        })
      })

    }
    const handleChangeEmail=(id)=>{
      setEnableEditEmail(id)
      }
      const changeUserEmail=(newemail,id)=>{
        console.log(id);
        setNewEmail(newemail)
  console.log(newemail,id);
  const updatedUsers = usersData.map((user)=> user._id === id ?{...user,email:newemail}:user)

      //console.log(usersData);
   
      setUsersData(updatedUsers)
      //console.log(usersData);
      setEnableEditEmail("")
      updateEmailHandler(id)
  }
    const updateEmailHandler=(id)=>{
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!"
      }).then(()=>{
        axios.put(`${process.env.REACT_APP_BASE_URL}/api/admin/${id}`, {email:newemail})
        .then(response => {
          // Handle success
          console.log('Updated successfully:', response.data);
        
        })
        .catch(error => {
          // Handle error
          console.error('Update failed:', error);
        })
      })
    }
    const deleteHandler=(id)=>{
      console.log(id);
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(() => {
        //req.query.id backend==>`${process.env.REACT_APP_BASE_URL}/api/admin/`,{params:{id:id}}shown id value in url
    //shown like /:id in url
        axios.delete(`${process.env.REACT_APP_BASE_URL}/api/admin/${id}`).then((resp)=>{
          console.log(resp);
          if (resp.data && resp.data.message === "User removed.") {
            Swal.fire({
              title: "Deleted!",
              text: "The file has been deleted.",
              icon: "success"
            }).then(()=>{
              const remainingUsers = usersData.filter((user)=>user._id !== id)
              setUsersData(remainingUsers)
            })
           // window.location.reload();
          }
        })
       
       
      });
      }
  return (
<Table striped bordered hover className='w-75 mx-auto '>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Admin</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {usersData.map(user => (
          <tr key={user._id}>
            <td >{user._id}</td>
            {enableEditName === user._id ?<td style={{position:"relative"}}><input type="text"   onBlur={(e)=>changeUsername(e.target.value,user._id)}/><FaCheck  style={{position:"absolute",right:"0"}} /></td>: 
            <td className='' style={{position:"relative"}}>{user.username}<FaPen onClick={()=>handleChangeName(user._id)} style={{position:"absolute",right:"0"}}/></td>}
           
           {enableEditEmail === user._id ? <td style={{position:"relative"}}><input type="email"   onBlur={(e)=>changeUserEmail(e.target.value,user._id)}/><FaCheck  style={{position:"absolute",right:"0"}} /></td>:
           <td className='' style={{position:"relative"}}>{user.email}<FaPen onClick={()=>handleChangeEmail(user._id)} style={{position:"absolute",right:"0"}}/></td>} 
           
           <td style={{textAlign:"end"}}>{user.isAdmin ?<TiTick className='fs-2 text-success bg-dark'/>:  <ImCross className='fs-3 p-2 text-danger bg-dark'/>}</td> 
           <td  style={{textAlign:"end"}}>{!user.isAdmin && <FaRegTrashAlt onClick={()=>{deleteHandler(user._id)}} className="bg-dark text-danger p-2 fs-3"/>}</td>
          </tr>
        ))}
      </tbody> 
    </Table>
  )
}

export default UsersList