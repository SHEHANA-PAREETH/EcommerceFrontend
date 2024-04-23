import React, { useState } from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {Container,Row,Col} from 'react-bootstrap'
import {Link} from 'react-router-dom'

import { FaTrashAlt } from "react-icons/fa";
import {addToCart, removeFromCart } from '../../toolkit/cartSlice'
import {useNavigate} from 'react-router-dom'
function Cart() {
  const dispatch= useDispatch()
  const navigate= useNavigate()
  const cart = useSelector ((state)=>state.cart)
  const {cartItems} = cart
 
 const [data,setUpdatedData] = useState(cartItems)
console.log(cartItems);
const removeFromCartHandler=(id)=>{
dispatch(removeFromCart(id))
}
const addtoCartHandler=(product,qty)=>{
  console.log(product);
 const  updatedCartItems =cartItems.map((item)=>item._id === product._id ? {...product,qty:qty}: item)
  console.log(qty);
  setUpdatedData(updatedCartItems)
  
dispatch(addToCart({...product,qty}))
}

const checkOutHandler=()=>{
navigate('/shipping')
}
  return (
   <Container>
    <Row>
      <Col className='d-flex justify-content-around itmes-start flex-wrap mx-auto mt-5'>
      {cartItems.length === 0 ? <div>Your cart is empty <Link to="/shop">Go To Shop</Link></div>:
      <>
      <div className='w-75'>
<h1 className='mb-4 font-weight-bold'>Shopping Cart</h1>
{data.map((item)=>
<div key={item._id} className='d-flex justify-content-center mb-1  p-2 border border-2 rounded'>
  <div style={{height:'5rem' ,width:"5rem"}}> 
  <img src={`${process.env.REACT_APP_BASE_URL}/uploads/${item.image}` } className=" w-100 h-100 object-fit-cover rounded" alt="" />
  </div>
  <div className='flex-grow-1'>
    <Link to={`/product/${item._id}`} className='text-decoration-none ms-3 ' style={{color:"hotpink"}}>
      <h6>{item.name.slice(0,30)}...</h6>
    </Link>
<div className='mt-2  ms-3'>
{item.brand}
</div>
<div className='mt-2  ms-3 font-weight-bold'>
&#8377; {item.price}
</div>
  </div>
<div className='w-24'>
<select name="" id="" className='w-100 p-1 border rounded text-dark' value={item.qty}  onChange={(e)=>addtoCartHandler(item,Number(e.target.value))}>
<option>select quantity</option>
      {Array.from({ length: item?.countInStock }, (_, index) => <option value={index+1}>{index+1}</option>)}
</select>
</div>
<div >
 
  <FaTrashAlt  onClick={()=>removeFromCartHandler(item._id)} className='ms-3' style={{color:"red",cursor:"pointer"}}/>
 

</div>

  </div>
)}
      </div>
      </>}
      
      </Col>
      <div>
  <h4>Items({cartItems.reduce((acc,item)=>acc + Number(item.qty),0)})</h4>
</div>
<div>
  <h3>&#8377;{cartItems.reduce((acc,item)=>acc+Number(item.price.replace(/,/g, ''))*Number(item.qty),0).toFixed(2)}</h3>
  
</div>
<div className='d-flex justify-content-center mt-5'>
<button disabled={cartItems.length === 0} className='border border-2 rounded p-2 w-50 ' style={{backgroundColor:"hotpink"}} onClick={checkOutHandler}>Proceed to Checkcout</button>
</div>

    </Row>
   </Container>
  )
}

export default Cart