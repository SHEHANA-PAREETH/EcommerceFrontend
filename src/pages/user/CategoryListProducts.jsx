import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BASE_URL } from '../../constants';
import  axios  from 'axios';
import ProductCard from '../../components/ProductCard';
import {Container,Row,Col,Card} from 'react-bootstrap'
function CategoryListProducts() {
    axios.defaults.withCredentials = true;
    const {id} = useParams()
   const [pdts,setPdts] = useState([])
    useEffect(()=>{
getSinglePdtCategories()
    },[])
    const getSinglePdtCategories=()=>{
        const categoryId =id;
        console.log(categoryId);
axios.get(`${BASE_URL}/api/product/getpdtsbytcategory/${categoryId}`).then((resp)=>{
   // console.log(resp.data.pdts);
    setPdts(resp.data.pdts)
    console.log(pdts);
   
})
    }
  return (
    <>
    {pdts.length === 0 ?<Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={10} md={8} lg={6}>
          <Card body className="text-center">
            <h2>No items to show</h2>
            <p className="text-muted">There are currently no items to display.</p>
          </Card>
        </Col>
      </Row>
    </Container>:<Container>
    <Row>
    <h2 className='text-center text-uppercase'>{pdts[0]?.category?.name}</h2>
        {pdts.map((pdt)=>
        <>
        <Col xs={12} md={4}>
           
           <ProductCard pdt={pdt}/>
           </Col>
        </>
        
          )}
      
    </Row>
  </Container>
       
    }
    </>
  
       
  )
}

export default CategoryListProducts