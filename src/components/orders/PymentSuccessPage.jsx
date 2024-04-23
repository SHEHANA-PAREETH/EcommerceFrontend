import React, { useEffect } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate ,useParams} from 'react-router-dom';

import axios from 'axios';
import { useSelector } from 'react-redux';

function PymentSuccessPage() {
  const {userInfo} =useSelector((state)=>state.auth)
    const navigate=useNavigate()
   const {id} = useParams()
   useEffect(()=>{
axios.put(`${process.env.REACT_APP_BASE_URL}/api/orders/${id}/pay`,{id:id,
  status:"successfully paid",
  update_time:new Date(),
  emailAddress:userInfo.email}).then((resp)=>{
  console.log(resp.data);
})
   },[])
   console.log(id);
  return (
    <Container className="mt-5">
    <Row className="justify-content-center">
      <Col xs={10} md={8} lg={6}>
        <div className="text-center">
          <h1 style={{ color: '#28a745' }}>Payment Successful!</h1>
          <p style={{ color: '#6c757d' }}>Your payment has been processed successfully.</p>
          <Button href="/" variant="success" onClick={()=>{navigate('/home')}}>Back to Home</Button>
        </div>
      </Col>
    </Row>
  </Container>
  )
}

export default PymentSuccessPage