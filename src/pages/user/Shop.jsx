import React from 'react'
import './Shop.css'
import {Container,Row,Col,Form} from 'react-bootstrap'
import { useEffect,useState } from 'react'
import {useDispatch,useSelector} from 'react-redux'
import { setCategories, setProducts } from '../../toolkit/shopSlice'
import  axios  from 'axios'

import ProductCard from '../../components/ProductCard'
import SpinnerComponent from '../../components/SpinnerComponent'
import ProductCardShop from '../../components/ProductCardShop'
function Shop() {
const dispatch = useDispatch()
const [priceFilter,setPriceFilter] = useState('')
const [brands,setbrands] = useState([])
const [selectedBrand,setSelectedBrand] = useState()
const [category,setCategory] = useState()
 const {categories,products,checked,radio}= useSelector((state)=>state.shop)
 useEffect(()=>{
  getallCategories()

 getAllProducts()
 },[])
 useEffect(()=>{
  getallCategories()
  getFilteredProducts()
  
 },[category,selectedBrand,priceFilter])
 const getAllProducts=()=>{
  axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/allproducts`).then((resp)=>{
      console.log(resp.data);
      dispatch(setProducts(resp.data)) 
  })
}
 const getallCategories=()=>{
  axios.get(`${process.env.REACT_APP_BASE_URL}/api/category/`).then((resp)=>{
      //console.log(resp.data);
      
      dispatch(setCategories(resp.data))
  })
}
const fecthBrands=(value)=>{
  axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/brands`,{params:{category:value}}).then((resp)=>{
    //console.log(resp.data);
    setbrands(Array.from(new Set(resp.data.brands)))
  
})
}
console.log(brands);

 
 
 const handleCheckbrand=(e)=>{
  //console.log(e.target.value);
  if(e.target.value){
    setSelectedBrand(e.target.value)
    console.log(selectedBrand);
  }
else{
  setSelectedBrand('')
}

 }
 const handleCheckCategory=(e)=>{
  
fecthBrands(e.target.value)
  setCategory(e.target.value)
  setPriceFilter('')
setSelectedBrand('')

 }
 const getFilteredProducts=()=>{
  
  axios.post(`${process.env.REACT_APP_BASE_URL}/api/product/filterd-products`,{category,brand:selectedBrand,price:priceFilter}).then((resp)=>{
    console.log(resp.data);
    if(resp.data){
      dispatch(setProducts(resp.data)) 
      }
    
  
  })

}
 const handlePriceChange=(e)=>{
 setPriceFilter(e.target.value) 
 }
 return (
   <>
   <Container >
    <Row>

      <Col xs={12} sm={4}  className='p-4 rounded category-navbar'>
        <div>
        <div style={{backgroundColor:"#151515"}} className='rounded p-2'>
        <h6 className='text-center    text-light'>Filter by Categories</h6>
        </div>

  {categories?.map((c) => (
        <div key={c._id} className="form-check">
          <input
           
           
            value={c.name}
            id={`radio-${c._id}`}
            onChange={ handleCheckCategory}
            className="form-check-input"
            type="radio"
      name="categories"
          
          />
          <label className="form-check-label" htmlFor={`radio-${c._id}`}>
            {c.name}
          </label>
        </div>
      ))}
        </div>
        <div>
        <div style={{backgroundColor:"#151515"}} className='rounded p-2'>
        <h6 className='text-center text-light'>Filter by Brands</h6>
        </div>

        {brands &&
        brands.map((b, index) => {
          if ( b !== null) {
            return (
              
              <div key={index} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id={`radio-${b}`}
                onChange={handleCheckbrand}
                value={b}
              />
              <label className="form-check-label" htmlFor={`radio-${b}`}>
                {b}
              </label>
            </div>
            );
          }
         
        })}
        </div>
        <div>
        <div style={{backgroundColor:"#151515"}} className='rounded p-2 mt-3'>
        <h6 className='text-center text-light'>Filter by Price</h6>
        </div>

  <div>
    <input type="text" placeholder='Enter Price' value={priceFilter} onChange={handlePriceChange} className='mt-3 form-control mt-3'/>
  </div>
        </div>
<div>
  <button type="reset"  className='btn mt-3 w-100 btn-secondary' onClick={()=>window.location.reload()}>Reset</button>
</div>
      </Col>
      <Col xs={12} sm={8} className='product-container'>
      <div>
        <h2>{products?.length} Products</h2>
      </div>
      <div className='d-flex flex-wrap justify-content-center ' style={{gap:"10px"}}>
        {products.length === 0 ? <SpinnerComponent/>:products.map((pdt)=><ProductCardShop pdt={pdt}/>)}
        
      </div>
      </Col>
    </Row>
   </Container>
   </>
  )
}

export default Shop