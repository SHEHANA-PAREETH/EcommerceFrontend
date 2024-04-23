import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Form ,Image,Table} from 'react-bootstrap';
import { useParams } from 'react-router-dom'
import axios from 'axios'

import {Container,Row,Col} from 'react-bootstrap'
import { SiBrandfolder } from "react-icons/si";
import { MdProductionQuantityLimits } from "react-icons/md";
import { CiStar } from "react-icons/ci";
import {useDispatch} from 'react-redux'
import { FaHeart } from "react-icons/fa6";
import { addToFavorites, removeFromFavorites } from '../toolkit/favoriteSice';
import {useSelector} from 'react-redux'
import Rating from './Rating';
import RatingForm from './RatingForm';
import AllReviews from './AllReviews';
import SmallProducts from './SmallProducts';
import { addToCart } from '../toolkit/cartSlice';
import {useNavigate} from 'react-router-dom'


function SingleProduct() {
  const { favoriteProducts} = useSelector((state)=>state.favorites)
  const [activeTab,setActiveTab] = useState(1)
    axios.defaults.withCredentials = true;
    const [qty,setQty] = useState(1)
    const [favon,setFavOn] = useState(false)
    const [data,setData] = useState()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {id} = useParams()
    console.log(id);
    useEffect(()=>{
        getSingleProduct()
    },[])
    const getSingleProduct=()=>{
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/${id}`).then((resp)=>{
          console.log(resp.data);
    setData(resp.data)
    
    })
       favoriteProducts.map((pdt)=>{
        if(pdt?._id === data?._id){
          setFavOn(true)
        }
       })
        
      }
      const currentTime = new Date()
      console.log(currentTime,new Date(data?.createdAt));
    const timeDifference = currentTime - new Date(data?.createdAt);
    
    // Convert milliseconds to hours
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    console.log(hoursDifference);
    const handleAddFavorites=(id)=>{
dispatch(addToFavorites(id))
setFavOn(true)
    }
    const handleRemoveFavorites=(id)=>{
      console.log(id);
      setFavOn(false)
      dispatch(removeFromFavorites(id))
      
    }
    const handleTabClick=(tab)=>{
setActiveTab(tab)
    }
    const addToCartHandler=()=>{
      console.log(qty);
      dispatch(addToCart({...data,qty}))

      navigate('/cart')
    }
  return (
<>

<Container>
      <Row>
        <Col xs={12} sm={12} md={5}>
          <Image src={`${process.env.REACT_APP_BASE_URL}/uploads/${data?.image}`} style={{height:"500px"}} alt="" fluid />
          <h4>{data?.name}</h4>
        </Col>
        <Col xs={12} sm={12} md={7}>
          <h4 className='d-none d-md-block'>{data?.name}</h4>
          <h2>&#8377; {data?.price}</h2>
          <p className='my-3'>{data?.description}</p>
          <Table>
            <tbody>
              <tr>
                <th><SiBrandfolder className='me-3' />Brand:</th>
                <td>{data?.brand}</td>
              </tr>
              <tr>
                <th><MdProductionQuantityLimits className='me-3' />Quantity:</th>
                <td>{data?.quantity}</td>
              </tr>
              <tr>
                <th>Count In Stock:</th>
                <td>{data?.countInStock}</td>
              </tr>
              <tr>
                <th onClick={favon ? () => handleRemoveFavorites(data._id) : () => handleAddFavorites(data._id)}>
                  <FaHeart className='fs-5 me-3' style={{ color: favon ? 'red' : 'black' }} />
                  {favon ? 'Remove from Favorites' : 'Add to Favorites'}
                </th>
                <td></td>
              </tr>
              <tr>
                <th>Added:</th>
                <td>{hoursDifference} hours ago</td>
              </tr>
              <tr>
                <th>Reviews</th>
                <td>{data?.numReviews}</td>
              </tr>
              <tr>
                <Rating value={data?.rating} text={`${data?.numReviews} reviews`} />
              </tr>
              <tr>
                <th>Select Count:</th>
                <td>
                  <Form.Select name="qty" value={qty} onChange={(e) => setQty(e.target.value)}>
                    <option>Select Quantity</option>
                    {Array.from({ length: data?.countInStock }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}
                  </Form.Select>
                </td>
              </tr>
              <tr>
                <th><Button disabled={data?.countInStock === 0} style={{ backgroundColor: 'hotpink', color: 'black', border: "none" }} onClick={addToCartHandler}>Add to Cart</Button></th>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className='my-5'>
        <Col md={3}>
          <div className='d-flex flex-column' style={{ gap: "20px" }}>
            <div className={`fs-5 ${activeTab === 1 ? "text-danger" : ''}`} onClick={() => handleTabClick(1)}>Write a Review</div>
            <div className={`fs-5 ${activeTab === 2 ? "text-danger" : ''}`} onClick={() => handleTabClick(2)}>All Reviews</div>
            <div className={`fs-5 ${activeTab === 3 ? "text-danger" : ''}`} onClick={() => handleTabClick(3)}>Related Products</div>
          </div>
        </Col>
        <Col md={9}>
          {activeTab === 1 && <RatingForm id={data?._id} />}
          {activeTab === 2 && (
            <div className='w-75'>
              {data.reviews.length === 0 ? <p>No reviews</p> : <AllReviews reviews={data.reviews} />}
            </div>
          )}
          {activeTab === 3 && <SmallProducts />}
        </Col>
      </Row>
    </Container>
</>
  )
}

export default SingleProduct