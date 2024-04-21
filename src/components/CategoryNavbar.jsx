import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'


import { Container,Row,Col } from 'react-bootstrap';
import { BASE_URL } from '../constants';

function CategoryNavbar() {
    axios.defaults.withCredentials = true
    const [categoryList,setCategoryList] = useState([])
 
  const navigate = useNavigate()
    useEffect(()=>{
getallCategories()
    },[])
    const getallCategories=()=>{
        axios.get(`${BASE_URL}/api/category/`).then((resp)=>{
            //console.log(resp.data);
            setCategoryList(resp.data)
        })
    }
const handleClick=(id)=>{
console.log(id);
navigate(`/singlecategorypdts/${id}`)
}

  
  return (
   <>
   
   <Container  fluid className='d-none d-xl-block ' style={{position:"sticky",top:"0",backgroundColor:"black"}}>
    <Row className="" >
    <Col className='p-4' >
   {categoryList.map((category)=>category?.name ? <span key={category._id}  style={{border:"2px solid grey",padding:"5px 10px",borderRadius:"5px",marginRight:"5px",cursor:"pointer",color:"white",textTransform:"uppercase"}} onClick={()=>handleClick(category._id,category.name)}>{category.name}</span>:"")}
   </Col>
    </Row>
  
   

</Container>
  
   </>
  )
}

export default CategoryNavbar