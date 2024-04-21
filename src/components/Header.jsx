import React, { useEffect, useState } from 'react'
import SpinnerComponent from './SpinnerComponent'
import {Container,Row,Col} from 'react-bootstrap'
import axios from 'axios'
import { BASE_URL } from '../constants';
import CarouselComponent from './CarousalComponent';
import ProductCard from './ProductCard';
function Header() {
    axios.defaults.withCredentials = true;
    const [loading,setLoading] = useState(false)
   
    const[productData,setProductData]= useState([])
    useEffect(()=>{
        getAllProducts()
    },[])
    const getAllProducts=()=>{
        axios.get(`${BASE_URL}/api/product/allproducts`).then((resp)=>{
            console.log(resp.data);
            setProductData(resp.data)

        })
}
    if(loading){
        return(
            <SpinnerComponent/>
        )
    }
    else{
        return (
          <Container fluid className='mt-2'>
            <Row className='' >
            <Col xs={12}  sm={12} lg={4} xl={6} className=' d-flex flex-wrap justify-content-center' >
                {productData.map((pdt)=>  
               <ProductCard pdt={pdt} />
             
             )}
               </Col>
                 
                  
               <Col lg={8}  xl={6} className='d-none d-lg-block position-fixed end-0'>
<CarouselComponent productData={productData} />
               </Col>
               </Row>
          </Container>
          )
    }
  
}

export default Header