import React, { useEffect, useState } from 'react'
import { Container,Row,Col,Button,Form} from 'react-bootstrap'
import AdminButtonGroup from './AdminButtonGroup'
import { useParams } from 'react-router-dom';
import axios from 'axios'
import { ToastSuccess } from '../../plugins/toast';

function ProductUpdate() {
  axios.defaults.withCredentials = true;
  const [data,setData] = useState()
  const [uploadedImage,setUploadedImage] = useState()
  const [category,setCategory] = useState([])
  const {id} = useParams();
  console.log(id);
  useEffect(()=>{
getSingleProduct()
getAllCategories()
  },[])
  const getSingleProduct=()=>{
    axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/${id}`).then((resp)=>{
      console.log(resp.data);
setData(resp.data)
    })
  }
  const handleChange = (event) => {
    const {name,value} =event.target;
    setData({ ...data, [name]: value });
  };
  const getAllCategories=()=>{
    axios.get(`${process.env.REACT_APP_BASE_URL}/api/category/`).then((resp)=>{
      console.log(resp.data);
setCategory(resp.data)
    })
  }
  const selectCategory=(item)=>{
    console.log(id);
    setData({ ...data, category:item});
    console.log(data);
  }
  const handleImageChange=(e)=>{
 setUploadedImage(e.target.files[0])
 
 console.log(uploadedImage);
  }
  const handleSubmit= async(e)=>{
   e.preventDefault()
   if(uploadedImage !== ""){
    setData({...data,image:uploadedImage})
   }
   
   try {
    const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/product/${id}`,data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
     
    });
    if(response.data.msg ==="updated suuccessfully"){
      ToastSuccess("Updated Successfully")
    }
  } catch (error) {
    console.error('Error updating product:', error);
    
  }
};
  
  return (
    
    <Container>
        <Row>
        <AdminButtonGroup/>
        <Col>
        <div className="bg-white p-4 rounded shadow mx-auto mt-5" style={{ width: '70%' }}>
        <h1 className='text-center'>Update Product</h1>
        <Form  onSubmit={handleSubmit}>
        <div  style={{width:"100%"}} className='d-flex justify-content-center'>
          {uploadedImage ? <img src={URL.createObjectURL(uploadedImage)} width="100"/> :<img   src={`${process.env.REACT_APP_BASE_URL}/uploads/${data?.image}`} alt="" width="100"/>}
         
        
        </div>
      <Form.Group controlId="image" >
      <Form.Label>Upload Image</Form.Label>
        <Form.Control type="file" name="image"  onChange={handleImageChange}/>
      </Form.Group>
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" name="name"  value={data?.name} onChange={handleChange} />
      </Form.Group>
      <Form.Group controlId="price">
        <Form.Label>Price</Form.Label>
        <Form.Control type="text" name="price" value={data?.price} onChange={handleChange}/>
      </Form.Group>
      <Form.Group controlId="quantity">
        <Form.Label>Quantity</Form.Label>
        <Form.Control type="text" name="quantity" value={data?.quantity} onChange={handleChange}/>
      </Form.Group>
      <Form.Group controlId="brand">
        <Form.Label>Brand</Form.Label>
        <Form.Control type="text" name="brand" value={data?.brand} onChange={handleChange}/>
      </Form.Group>
      <Form.Group controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} name="description"  value={data?.description} onChange={handleChange}/>
      </Form.Group>
      <Form.Group controlId="countInStock">
        <Form.Label>Count in Stock</Form.Label>
        <Form.Control type="text" name="countInStock"  value={data?.countInStock} onChange={handleChange}/>
      </Form.Group>
      <Form.Group controlId="countInStock">
        <Form.Label>Select Category</Form.Label>
        <Form.Control type="text" name="countInStock"  value={data?.category?.name} onChange={handleChange}/>
      </Form.Group>
      <h4 className='mt-2'>Select category</h4>
      <div>
      {category.map((item)=><Button key={item._id} onClick={()=>selectCategory(item)} className='me-2 mt-3 bg-dark border-dark'>{item.name}</Button>)}
      </div>

     <Button className='mt-3 bg-light text-dark' type="submit">
        Update
      </Button>
    </Form>
    </div>
        </Col>
        </Row>
      </Container>
  )
}

export default ProductUpdate