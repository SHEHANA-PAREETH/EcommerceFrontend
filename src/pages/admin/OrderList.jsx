import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../constants'
import axios from 'axios'
import { Table } from 'react-bootstrap';
function OrderList() {
    const [allOrders,setallOrders] = useState([])
    axios.defaults.withCredentials = true;
    useEffect(()=>{
        getAllOrders()
    },[])

    const getAllOrders = ()=>{
        axios.get(`${BASE_URL}/api/orders`).then((resp)=>{
console.log(resp.data);
setallOrders(resp.data)
        }).catch((error)=>{
            console.log(error);
        })
    }
  return (
 <div>
      <Table striped bordered hover variant="dark" className='mt-5'>
      <thead>
        <tr>
            <th>Item</th>
          <th>Item Name</th>
          <th>User</th>
          <th>Date</th>
          <th>Total</th>
          <th>Paid</th>
          <th>Delivered</th>
        </tr>
      </thead>
      <tbody>
        {allOrders.map((order)=>
        <tr>
            <td><img src={`${BASE_URL}/uploads/${order.orderItems.image}`} alt="" style={{width:"100px",height:"100px"}}/></td>
            <td>{order.orderItems.name}</td>
            <td>{order.user.username}</td>
            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>{order.orderItems.price}</td>
        {order.isPaid?<td ><span style={{ padding: '5px', borderRadius: '20px', backgroundColor: 'blue', color: 'white', textAlign: 'center', cursor: 'pointer' }}>completed</span></td>:<td><span style={{ padding: '5px', borderRadius: '20px', backgroundColor: 'red', color: 'white', textAlign: 'center', cursor: 'pointer' }}>pending</span></td>}

       {order.isDelivered?<td><span style={{ padding: '5px', borderRadius: '20px', backgroundColor: 'blue', color: 'white', textAlign: 'center', cursor: 'pointer' }}>completed</span ></td>:<td> <span style={{ padding: '5px', borderRadius: '20px', backgroundColor: 'red', color: 'white', textAlign: 'center', cursor: 'pointer' }} >pending</span></td>}
       
        </tr>)}
      </tbody>
    </Table>
 </div>
  )
}

export default OrderList