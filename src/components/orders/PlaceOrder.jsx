import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'

import { Table } from 'react-bootstrap';
import { ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { ToastSuccess } from '../../plugins/toast';
import {clearCartItems} from '../../toolkit/cartSlice'
function PlaceOrder() {
  const dispatch = useDispatch()
  axios.defaults.withCredentials = true;
    const navigate = useNavigate()
    const cart = useSelector(state=>state.cart)
   const placeOrderHandler=async()=>{
    try{
      const resp = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/orders/`,{
        orderItems: cart.cartItems,
        shippingAddress:cart.shippingAddress,
        paymentMethod:cart.paymentMethod,
       /* itemsPrice:cart.itemsPrice,
        shippingPrice:cart.shippingPrice,
        taxPrice:cart.shippingPrice,
        totalPrice:cart.totalPrice*/
      })
      console.log(resp.data);
      if(resp.data){
        ToastSuccess("Placed order successfully")
        navigate(`/orders`)
        dispatch(clearCartItems())
     //clear cart
      }
    }
catch(error){
  console.log(error);
}
   }
  return (
   <div>
    
    <div>
        {cart.cartItems.length === 0 ?(
            <p>your cart is empty</p>
        ):(
            <div>
                
<Table striped bordered hover className='w-75 mx-auto mt-5'>
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {cart.cartItems.map((item, index) => (
          <tr key={index}>
            <td>
              <img src={`${process.env.REACT_APP_BASE_URL}/uploads/${item.image}`} style={{ height: "100px",width:"100px" }} alt="" />
            </td>
            <td>{item.name}</td>
            <td>{item.qty}</td>
            <td>{item.price}</td>
            <td>{Number(item.price.replace(/,/g, ''))*Number(item.qty)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
            </div>
        )}
    </div>
    <div className='m-5 w-75 mx-auto' >
       
        <div  className='d-flex justify-content-between'>
        <div >
        <h2>Order Summary</h2>
      <ListGroup>
        <ListGroup.Item>
          <span>ItemsPrice:</span>
          {cart.itemsPrice}
        </ListGroup.Item>
        <ListGroup.Item>
          <span>ShippingPrice:</span>
          {cart.shippingPrice}
        </ListGroup.Item>
        <ListGroup.Item>
          <span>TaxPrice:</span>
          {cart.taxPrice}
        </ListGroup.Item>
        <ListGroup.Item>
          <span>TotalPrice:</span>
          {cart.totalPrice}
        </ListGroup.Item>
      </ListGroup>
    </div>
    <div>
<h2>shipping</h2>
<p>{cart?.shippingAddress?.address}</p>{cart?.shippingAddress?.city}<p>{cart?.shippingAddress?.postalcode}</p>
<p>{cart?.shippingAddress?.country}
</p>

    </div>
    <div>
<h2>Payment Method</h2>
<p>{cart.paymentMethod}</p>
    </div>
        </div>
        
   </div>
   <div className='d-flex justify-content-center'>
     <Button variant="secondary" className='w-50 my-5' onClick={placeOrderHandler}>Place Order</Button>
   </div>
   </div>
   
  )
}

export default PlaceOrder