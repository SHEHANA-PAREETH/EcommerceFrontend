import React from 'react'

import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap';

function ProductCard({pdt}) {
  return (
    <>
   <Link to={`/product/${pdt._id}`} className='text-decoration-none text-dark'>
   <Card className='m-3 shadow-sm' style={{ width:'250px',zIndex:"-1"}}>
      
      
        <Card.Img variant='top' src={`${process.env.REACT_APP_BASE_URL}/uploads/${pdt.image}`} alt={pdt.name} style={{ objectFit: 'contain', width: '100%', height: '200px' }}/>
        <Card.Body style={{ backgroundColor: 'rgba(0,0,0,.7)', color: 'white' ,height:"150px"}}>
          <Card.Title className='text-center'>{pdt.name.slice(0, 50)}...</Card.Title>
          <div className='d-flex justify-content-center align-items-center'>
            <span className='text-dark bg-light p-2 border border-2 rounded'>
              &#8377;{pdt.price}
            </span>
          </div>
        </Card.Body>
    </Card>
    </Link>

 
    
   
    </>
  )
}

export default ProductCard