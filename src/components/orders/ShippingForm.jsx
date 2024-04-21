import React, { useState } from 'react';
import { Form, Button, Container, Col,Row } from 'react-bootstrap';
import { savePaymentMethod, saveShippingAddress } from '../../toolkit/cartSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastError } from '../../plugins/toast';
import ProgressSteps from './ProgressSteps';

function ShippingForm() {
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Stripe');
const navigate = useNavigate()
const dispatch = useDispatch()
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        if(address === "" || paymentMethod === "" || city ==="" || postalCode===""||country===""){
            ToastError("please fill all fields")
            return
        }
        dispatch(saveShippingAddress({address,city,postalCode,country}))
    dispatch(savePaymentMethod(paymentMethod))
navigate('/placeorder')    
}
    ;

    return (
        <Container >
           
             <h2>Shipping</h2>
            <Row>
                <Col sm={6} className='mx-auto'>
                <Form onSubmit={handleSubmit}>
                <Form.Group controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="postalCode">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter postal code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Check
                        type="radio"
                        label="Stripe"
                        id="stripe"
                        name="paymentMethod"
                        checked={paymentMethod === 'Stripe'}
                        onChange={() => setPaymentMethod('Stripe')}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
              continue..
                </Button>
            </Form>
                </Col>
            </Row>
            
        </Container>
    );
}

export default ShippingForm;
