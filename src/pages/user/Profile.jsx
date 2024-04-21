import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../constants';
import axios from 'axios';

const Profile = () => {
  const {userInfo}=useSelector((state)=>state.auth)
  const [username, setNewUsername] = useState(userInfo.username);
  const [email, setNewEmail] = useState(userInfo.email);
const [password,setPassword] = useState()
const[confirmPassword,setConfirmPassword] =useState()
axios.defaults.withCredentials = true;
const handleSubmit=(e)=>{
  e.preventDefault()

axios.put(`${BASE_URL}/api/users/profile`, {username,email,password})
.then(response => {
  console.log(response.data);
 
})
.catch(error => {
  console.error(error);
  // Handle error
});
}
  return (
    <Container className='w-50 mx-auto'>
      <h2>Profile</h2>
      <Form  onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <Button className='mt-3' variant="primary" type="submit">
          Update Profile
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;
