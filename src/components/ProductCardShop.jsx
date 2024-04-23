import React from 'react'
import {Link, useNavigate} from 'react-router-dom'

import { AiOutlineShoppingCart } from 'react-icons/ai';
import { useDispatch } from 'react-redux'
import { addToCart } from '../toolkit/cartSlice';
import {ToastSuccess} from '../plugins/toast'
function ProductCardShop({pdt}) {
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const addToCartHandler=(pdt,qty)=>{
dispatch(addToCart({...pdt,qty}))
ToastSuccess("item added successfully")
navigate('/cart')
  }
  return (
    
    <div className='position-relative border p-2 rounded d-flex flex-column justify-content-between' style={{width:"300px"}}>
     <div>
     <span  className=' bg-dark text-light rounded  position-absolute end-0'>
    {pdt.brand}
</span>
<img className='cursor-pointer' src={`${process.env.REACT_APP_BASE_URL}/uploads/${pdt.image}`} style={{width:'130px',objectFit:"contain",height:"200px"}} alt="" />
<div className='d-flex justify-content-between'>
    <h6>{pdt.name.slice(0,10)}</h6>
    <h6>{pdt.price}</h6>
</div>
<div>
    <p>{pdt.description.substring(0,60)}...</p>
</div>
     </div>

      
        <div className='d-flex justify-content-between'>
 <Link to={`/product/${pdt._id}`} className='text-decoration-none'>
 <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
      Read More
    </button>
 </Link>
 <AiOutlineShoppingCart color="green" size={24} onClick={()=>addToCartHandler(pdt,1)}/>
        </div>
      
        </div>
  )
}

export default ProductCardShop