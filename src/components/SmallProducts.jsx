import axios from 'axios';
import React, { useState, useEffect  } from 'react'
import { Card ,Container,Row,Col} from 'react-bootstrap';

import { Link } from 'react-router-dom';
function SmallProducts() {
    axios.defaults.withCredentials = true;
    const [productData,setProductData] = useState([])
    const [detailedView,setDetailedView] = useState(false)
   const [singlepdtData,setSingleProductData] = useState()
    useEffect(()=>{
        getAllProducts()
    },[])
    const getAllProducts=()=>{
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/allproducts`).then((resp)=>{
            console.log(resp.data);
            setProductData(resp.data)
        })
}

  return (
    <>
    
    <div className='d-flex flex-wrap justify-content-center mt-3' style={{gap:"40px"}}>
{productData.map((pdt)=>
  
        <Card style={{ width: '12rem',height:"15rem" }} >
      <Card.Img className="w-100 h-50" variant="top" src={`${process.env.REACT_APP_BASE_URL}/uploads/${pdt.image}`} />
      <Card.Body>
        <p>{pdt.name.slice(0,30)}...</p>
      </Card.Body>
    </Card>
  
    )}
</div>

  

   
    </>
    

  )
}

export default SmallProducts