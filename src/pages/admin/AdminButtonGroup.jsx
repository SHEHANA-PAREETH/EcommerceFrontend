
import React, { useState } from 'react';
import { ButtonGroup,  Button } from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'

const AdminButtonGroup = () => {
  const navigate= useNavigate()
const handleCreateProduct=()=>{
  navigate('/admin/createproduct')
}
const handleAllProduct=()=>{
  navigate('/admin/products')
}
const buttonStyle={
  color:"white",
  backgroundColor:"hotpink",
  border:"none",
}
const buttonStyle2={
  color:"black",
  backgroundColor:"yellow",
  border:"none",
}
    return (
        <>
      <div className='d-flex justify-content-center'>
      <ButtonGroup >
        <Button style={buttonStyle}  onClick={handleAllProduct}>All products</Button>
        <Button style={buttonStyle2} onClick={handleCreateProduct}>create product</Button>
       
      </ButtonGroup>
      </div>
      
     
     
       
        </>
    );
};

export default AdminButtonGroup;
