import React from 'react'
import { Card } from 'react-bootstrap';
import Rating from './Rating';
function AllReviews({reviews}) {
  console.log(reviews);
  return (
    <>
    {reviews.map((review)=>
  <Card>
  <Card.Body className='d-flex justify-content-between'>
    <div>
    <Card.Title>{review.name}</Card.Title>
    <Card.Subtitle className="mb-2 "><Rating value={review.rating}/></Card.Subtitle>
    <Card.Text>Comment:{review.comment}</Card.Text>
    </div>
    

    <Card.Subtitle className="mb-2 " style={{color:"grey"}}>{review.createdAt.split('T')[0]}<br/>{review.createdAt.split('T')[1].split('.')[0]}</Card.Subtitle>
   
  </Card.Body>
</Card>
  )}
    
    </>
  )
}

export default AllReviews