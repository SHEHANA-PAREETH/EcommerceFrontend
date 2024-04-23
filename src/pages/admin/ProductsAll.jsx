import React, { useEffect, useState } from 'react'
import AdminButtonGroup from './AdminButtonGroup'
import {Container, Row,Col, Button} from 'react-bootstrap'

import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2';

function ProductsAll() {
    axios.defaults.withCredentials = true;
    const navigate = useNavigate()
    const [productData,setProductData] = useState([])
    useEffect(()=>{
        getAllProducts()
        },[])
        const getAllProducts=()=>{
            axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/allproducts`).then((resp)=>{
                console.log(resp.data);
                setProductData(resp.data)
            })
}
const handleUpdateProduct=(id)=>{
    navigate(`/admin/updateproducts/${id}`)
  }
  const handleDeleteProduct=(id)=>{
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this product!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.isConfirmed) {
          // User confirmed, proceed with deletion
          axios.delete(`${process.env.REACT_APP_BASE_URL}/api/product/${id}`)
            .then((response) => {
              // Handle success
              Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
              // Optionally, update your UI to reflect the deletion
              const updatedProducts = productData.map((product)=>product._id === id ? product=null :product)
              console.log(updatedProducts);
              setProductData(updatedProducts)
            })
            .catch((error) => {
              // Handle error
              Swal.fire('Error', 'An error occurred while deleting the product.', 'error');
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // User canceled, do nothing
        }
      });
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

    <Container >
      
        <AdminButtonGroup/>
<div >
<h3> AllProducts:{productData.length}</h3>
{productData?.map((product)=> {
    if(product!== null){
        return(
<Row className='d-flex text-center mt-4 align-items-center justify-content-center border border-1 rounded shadow-lg ' key={product._id}>
            <Col className='p-1'>
        <img src={`${process.env.REACT_APP_BASE_URL}/uploads/${product.image}`} alt="" width="250" height="250" />
        </Col >
        <Col style={{textAlign:"left"}}>
        <h4 >{product.name}</h4>
        <p style={{height:'50px',overflow:"hidden",textAlign:"left",color:"grey"}}>{product.description}</p>
        <div className='d-flex justify-content-between'>
        <Button  onClick={()=>handleUpdateProduct(product._id)} style={buttonStyle}>update product</Button>
        <Button  onClick={()=>handleDeleteProduct(product._id)} style={buttonStyle2}>delete product</Button>
        </div>
        
        </Col>
        <Col>
        <p>{new Date(product.createdAt).toDateString()}</p>
        <p>{product.price}</p>
        </Col>
            </Row>
        )
    }
   
}

)}
</div>
       
        
       
      

    </Container>

       
      
  )
}

export default ProductsAll