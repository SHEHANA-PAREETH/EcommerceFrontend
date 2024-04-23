import React, { useEffect, useState } from 'react'
import {useSelector} from 'react-redux'
;
import {Container, Row,Col,Button} from 'react-bootstrap'
import axios from 'axios'
import { Card } from 'react-bootstrap';
import { FaHeart } from "react-icons/fa6";
import { incrementCount, removeFromFavorites } from '../../toolkit/favoriteSice';
import {useDispatch} from 'react-redux'
function Favorites() {
  const dispatch = useDispatch()
  const [favPdts,setFavPdts] = useState([])
  const favorites = useSelector((state)=>state.favorites)
  console.log(favorites.favoriteProducts);
 useEffect(()=>{
getFavProducts()
 },[favorites])
 axios.defaults.withCredentials = true;
 const getFavProducts=()=>{
  axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/favpdts/${favorites.favoriteProducts.join(',')}`).then((res)=>{
    console.log(res.data);
    setFavPdts(res.data)
   
   })
 }
 console.log(favPdts?.length);
 dispatch(incrementCount(favPdts.length))
const removeHandler=(id)=>{
  dispatch(removeFromFavorites(id))
}
  return (
 <Container>
  <h1 className='text-center my-5' style={{color:"red"}}>My Favorites</h1>
  <Row className='g-5'>
    
    {favPdts.map((pdt)=>
    <Col  xs={12} lg={6} xl={5}>
    <Card >
      <div className="d-flex">
    
     <FaHeart className='fs-5 ms-1' style={{color:"red",cursor:"pointer"}} onClick={()=>removeHandler(pdt._id)}/>
         
     
       
      
        <Card.Img variant="top" src={`${process.env.REACT_APP_BASE_URL}/uploads/${pdt.image}`} style={{ width: '150px',height:"150px" }} />

        <Card.Body>
          <Card.Title>{pdt.name.slice(0,30)}</Card.Title>
          <Card.Text>
           <p>{pdt.description.slice(0,45)}..</p>
          </Card.Text>
        </Card.Body>
      </div>
    </Card>
    </Col>
    )}
    
 
  </Row>
 </Container>
  )
}

export default Favorites