import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Nav } from 'react-bootstrap';
import axios from 'axios';
import { ToastError, ToastSuccess } from '../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import { BsEyeFill, BsEyeSlashFill} from 'react-icons/bs';
import { BiSolidErrorCircle } from "react-icons/bi";
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });
  const [errors, setErrors] = useState({});
const navigate = useNavigate()
const togglePasswordVisibility = () => {
  setFormData({
    ...formData,
    showPassword: !formData.showPassword,
  });
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  axios.defaults.withCredentials = true;
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your sign-up logic here
    console.log(formData);
    const newErrors = {};

    // Name validation (only alphabets and spaces allowed)
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z ]+$/.test(formData.username)) {
      newErrors.username = 'Invalid username';
    }
  
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
  
    // Password validation (at least 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character)
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
  
    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      // Proceed with form submission
      console.log('Form submitted:', formData);
      try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/users`, formData);
        console.log('Response:', response.data);
        if(response.data && response.data.message){
          ToastSuccess("successfully created account")
          setTimeout(() => {
            navigate("/login")
          }, 2000);
          
        }
        // Add your navigation logic or other actions here
      } catch (error) {
        console.error('Error:', error);
        if(error.response && error.response.data.error)
        ToastError(error.response.data.error)
        // Add your error handling logic here
      }
    }
    
    
  };
  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <div className="error-message">
          <BiSolidErrorCircle className="error-icon"  style={{color:"red"}}/>
          <span style={{color:"red"}}> {errors[fieldName]}</span>
         
        </div>
      );
    }
    return null;
  };
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 style={{color:"#2186A6",fontWeight:"bolder"}}>Sign Up</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                
              />
            </Form.Group>
            {renderError('username')}
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              
            </Form.Group>
            {renderError('email')}
            <Form.Group controlId="password" >
              <Form.Label>Password</Form.Label>
              <div className="password-input" style={{position:"relative"}}>
                <Form.Control
                  type={formData.showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  
                />
                <div className="password-toggle" onClick={togglePasswordVisibility}>
                  {formData.showPassword ? <BsEyeSlashFill style={{position:"absolute",right:"0",top:"9px"}}/> : <BsEyeFill style={{position:"absolute",right:"0",top:"9px"}}/>}
                </div>
              </div>
            </Form.Group>
            {renderError('password')}
            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Form.Group>
            {renderError('confirmPassword')}
            <Button style={{backgroundColor:"#2186A6"}} className='mt-3'  type="submit">
              Sign Up
            </Button>
          </Form>
          <div className='d-flex'>
          <p className='me-5'>already an account  ?  </p> <Nav.Link  style={{color:"#2186A6",fontWeight:"bolder"}} href="/login">Login</Nav.Link>
          </div>
         
        </Col>
        <Col md={6} className='d-none d-md-block' >
        <img src="images/signupimage.jpg" style={{width:"100%",height:"85vh"}} alt="" />
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
