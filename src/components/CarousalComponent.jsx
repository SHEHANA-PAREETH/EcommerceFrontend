import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../constants';
import {Carousel} from 'react-bootstrap'
import { CgOverflow } from 'react-icons/cg';

const CarouselComponent = ({productData}) => {
    const [index, setIndex] = useState(0);
   const [images,setImages]= useState([])
     useEffect(()=>{
    const pdtImages = productData.map((pdt)=>pdt.image)
    setImages(pdtImages)
     console.log(images);
  },[productData])
 
 
  
    return (
     
        <Carousel className='w-100' >
{productData.map((pdt,index)=>
    <Carousel.Item  key={pdt._id}>
        <div className=' border border-5 shadow-sm rounded d-flex justify-content-center align-items-center' style={{backgroundColor:"rgb(0,0,0)"}} >
        <img style={{height:"75vh",width:"100%"}}
              className="rounded"
              src={`${BASE_URL}/uploads/${pdt.image}`}
              alt={`Slide ${index}`}
            />
        <Carousel.Caption className='d-flex flex-column align-items-center mb-5'>
          <h6 style={{backgroundColor:"rgba(0,0,0,0.8)",maxWidth:"70%"}} className='p-1 border rounded'>{pdt.name.slice(0,60)}....</h6>
          <p     style={{backgroundColor:"rgba(255,255,255,0.5)", color:"black"}} className='p-1 border rounded'>{pdt.description.slice(0,201)}...</p>
        </Carousel.Caption>
     
        </div>
        </Carousel.Item>
)}
            
       
      </Carousel>
      
      
    );
  };
  
  export default CarouselComponent;
  