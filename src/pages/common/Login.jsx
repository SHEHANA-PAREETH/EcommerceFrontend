import React, { useState } from 'react'
import {Form, Container,Row,Col, Button, Nav} from 'react-bootstrap'
import SpinnerComponent from '../../components/SpinnerComponent'
import { BASE_URL } from '../../constants'
import axios from 'axios'
import { setCredentials } from '../../toolkit/authSlice'
import { UseDispatch, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ToastError } from '../../plugins/toast'

function Login() {
    const dispatch = useDispatch()
    const [email,setEmail]= useState("")
    const [password,setPassword] = useState("")
const [loading,setLoading] = useState(false)
axios.defaults.withCredentials =  true;
const navigate= useNavigate()
    const handleSubmit= async(e)=>{
e.preventDefault()
console.log(email,password);
setLoading(true)
try {
    const resp = await axios.post(`${BASE_URL}/api/users/auth`,{email,password})
console.log(resp.data);
dispatch(setCredentials(resp.data))
setLoading(false)
navigate('/')
  } catch (error) {
    
    console.error('Error fetching data:', error);
    if(error.response && error.response.data.error === "email doesn't exist, create an account")
    ToastError(error.response.data.error)
    if(error.response && error.response.data.error === "invalid password")
    ToastError(error.response.data.error)
  }
  setLoading(false)
    }
  return (
   <>
   <Container>
    <Row>
        <Col md={6} >
        <Form onSubmit={handleSubmit}>
            <h1 style={{color:"#2186A6",fontWeight:"bolder"}}>Sign In</h1>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="" name="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
      </Form.Group>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
        <Form.Label>password</Form.Label>
        <Form.Control type="password" placeholder="" name="password" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
      </Form.Group>
      <Button  type="submit" style={{backgroundColor:"#2186A6"}}> Submit</Button>
      <div className='d-flex gap-4'>
      <p>new customer ? </p> <Nav.Link style={{color:"#2186A6",fontWeight:"bolder"}} href="/register">Register</Nav.Link>
      </div>
     
    </Form>
    {loading && <SpinnerComponent/>}
        </Col>
        <Col md={6} className='d-none d-lg-block'>
          <img src="images/loginimage.jpg" style={{width:"100%",height:"85vh"}} alt="" />
        </Col>
    </Row>
   
   </Container>
    
   </>
  )
}

export default Login