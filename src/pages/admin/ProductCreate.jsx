import React, { useEffect, useState } from 'react'
import { Button ,Form} from 'react-bootstrap'
;
import axios from 'axios';
import { ToastError, ToastSuccess } from '../../plugins/toast';
import {useNavigate} from 'react-router-dom'
import AdminButtonGroup from './AdminButtonGroup';

function ProductCreate() {
  axios.defaults.withCredentials = true;
    const [productData, setProductData] = useState({
        image: '',
        name: '',
        price: '',
        quantity: '',
        brand: '',
        description: '',
        countInStock: '',
        category: ''
      });
      const [categoryList,setCategoryList] = useState([])
      const navigate= useNavigate()
    useEffect(()=>{
getAllCategories()
    },[])
    const getAllCategories=()=>{
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/category/`).then((resp)=>{
            //console.log(resp.data);
            setCategoryList(resp.data)
        })
    }
     const handleImageChange=(e)=>{
      setProductData({...productData, image:e.target.files[0] })
    
     }
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        const { image,
        name,
        price,
        quantity,
        brand,
        description,
        countInStock,
        category} = productData;
        if(image === ""||
        name === ""||
        price === ""||
        quantity=== "" ||
        brand=== ""||
        description === ""||
        countInStock === ""||
        category === ""){
          ToastError("Fill all fields")
          return
        }

       
        // Add your logic to handle form submission here
    
      
        console.log(productData);
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/product`, productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((resp)=>{
        //console.log(resp?.data)
        if(resp?.data.msg === "added successfully"){
          ToastSuccess("added successfully")
          navigate('/admin/products')
        }})

      };
  return (
    <div className="">
      <AdminButtonGroup/>
    <div className="bg-white p-4 rounded shadow mx-auto mt-5" style={{ width: '70%' }}>
        <h1 className='text-center'>Create Product</h1>
        <Form onSubmit={handleSubmit} >
      <Form.Group controlId="image" >
        <div  style={{width:"100%"}} className='d-flex justify-content-center'>
        <img   src={productData?.image && URL?.createObjectURL(productData?.image)} alt="" style={{objectFit:"contain",width:"100%"}}/>
        </div>
       
        <Form.Label>Upload Image</Form.Label>
        <Form.Control type="file" name="image" onChange={handleImageChange} />
      </Form.Group>
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" name="name" onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="price">
        <Form.Label>Price</Form.Label>
        <Form.Control type="text" name="price" onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="quantity">
        <Form.Label>Quantity</Form.Label>
        <Form.Control type="text" name="quantity" onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="brand">
        <Form.Label>Brand</Form.Label>
        <Form.Control type="text" name="brand" onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} name="description" onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="countInStock">
        <Form.Label>Count in Stock</Form.Label>
        <Form.Control type="text" name="countInStock" onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="category">
        <Form.Label>Category</Form.Label>
        <Form.Control as="select" name="category" onChange={handleChange}>
          <option value="">Select Category</option>
          {categoryList.map((category) => (
            <option key={category.name} value={category._id}>
              {category.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button variant="primary" className='mt-3' type="submit">
        Submit
      </Button>
    </Form>
    </div>
   
    </div>
  )
}

export default ProductCreate