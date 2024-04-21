import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../constants'
import axios from 'axios';
import { Container, Row, Col, Card,Button } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';

const stripePromise = loadStripe('pk_test_51P65lNSC8qQELg2OZ4qru9qShzAHtdVAjfYb7etfXp5oVf4Q4yG7FzfDGwFbcuf2EMMpJs1SM9GULVAZmVJb18Wl00NntrIAUr');


function Orders() {
  const {userInfo} = useSelector((state)=>state.auth)
  
    const [orders,setOrders] = useState([])
    axios.defaults.withCedentials =true;
    useEffect(()=>{
axios.get(`${BASE_URL}/api/orders/mine`).then((resp)=>{
    console.log(resp.data);
    setOrders(resp.data)
})
    },[])
   
    const paymentHandler= async (id,cartItems)=>{
        try {
            console.log(id,cartItems);
const response = await axios.post(`${BASE_URL}/api/config/stripe/checkout-session`,{orderItems:cartItems,id,email:userInfo.email})          
            
      if(response.data.session){
          const stripe = await stripePromise;
         const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.session.id
        });   
        if(error){
          console.log(error);
        }
      };
  

      
          } catch (error) {
            console.error('Error fetching session ID:', error);
          
          }
        };
  return (
    <Container className="mt-5">{orders.length === 0 ? 
    <Row className="justify-content-center">
      <Col xs={10} md={8} lg={6}>
        <Card body className="text-center">
          <h2>No items to show</h2>
          <p className="text-muted">There are currently no  to display.</p>
        </Card>
      </Col>
    </Row>
:<Row>
    <Col>
    {orders.map((order) => (
        <Card key={order._id} className="mb-3">
          <Card.Header>
            <h5>Order ID: {order._id}</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col sm={4}>
                <h6>Shipping Address:</h6>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}</p>
                <p>{order.shippingAddress.country}</p>
                <p>{order.shippingAddress.postalCode}</p>
              </Col>
              <Col>
                <h6>Order Items:</h6>
                {order.orderItems.map((item) => (
                  <div key={item._id} className="d-flex align-items-center mb-2">
                    <img src={`${BASE_URL}/uploads/${item.image}`} alt={item.name} style={{ width: '100px', marginRight: '10px' }} />
                    <div>
                      <h6>{item.name.slice(0, 60)}...</h6>
                      <p>Quantity: {item.qty}</p>
                      <p>Price: {item.price}</p>
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
            <Row>
              <Col>
                <p>Shipping Price: {order.shippingPrice}</p>
                <p>Tax Price: {order.taxPrice}</p>
                <p>Total Price: {order.totalPrice}</p>
              </Col>
            
              <Col>
                <p>Status: {order.isPaid ? 'Paid' : 'Not Paid'}</p>
                
                {!order.isPaid && <Button variant="primary" onClick={()=>paymentHandler(order._id,order.orderItems)}   className="mt-2">Proceed to Payment</Button>}
              </Col>
              {order.isPaid&&<Col>
              <p><strong>PaidAt :</strong>{new Date(order?.paidAt).toLocaleString()}</p>
             <p><strong>PaymentStatus:</strong>{order?.paymentResult?.status}</p>
              <p><strong>DeliveryStatus:</strong>{order.isDelivered?"":"not delivered"}</p>
              </Col>}
              
            </Row>
          </Card.Body>
        </Card>
      ))}
    </Col>
  </Row>
    }
      
    </Container>
  )
}

export default Orders