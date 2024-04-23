import React, { useEffect, useState } from 'react'

import axios from 'axios'
import './CategoryList.css'

import { Form, Button, Container } from 'react-bootstrap';
import { ToastError, ToastSuccess } from '../../plugins/toast';
import ModalComponent from '../../components/ModalComponent';
function CategoryList() {
    axios.defaults.withCredentials = true
    const [categoryList,setCategoryList] = useState([])
    const [categoryName, setCategoryName] = useState('');
    const [modal,setModal]= useState(false)
    const [selectedCategory,setSelectedCategory]= useState()
    useEffect(()=>{
getallCategories()
    },[categoryName])
    const getallCategories=()=>{
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/category/`).then((resp)=>{
            //console.log(resp.data);
            setCategoryList(resp.data)
        })
    }
   const updatedCategoryHnadler=(id,updatedvalue)=>{
    console.log(id,updatedvalue);
   
   const updatedCategoryList = categoryList.map((category)=>category._id === id ? {...category,name:updatedvalue} : category)
setCategoryList(updatedCategoryList)
   }

    const handleSubmit = async (e) => {
        
    try {
        e.preventDefault();
        // Handle form submission here, e.g., send data to backend
        //console.log('Category Name:', categoryName);
        // Reset the form after submission
    setCategoryName(e.target.value)
    console.log(categoryName);
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/category/`, {
            name: categoryName
        });
        console.log('Category added successfully:', response.data);
        setCategoryName('');
        if(response.data){
            ToastSuccess("Category added succesfully")
        }
       
    } catch (error) {
        console.error('Error adding category:', error);
        ToastError("something went wrong")
    }
    };
    const handleCategoryClick=(category)=>{
//console.log(category);
setSelectedCategory(category)
console.log(selectedCategory);
setModal(true)
    }
  return (
   <>
   <Container className='category-top-container '>
   <h2 className='mt-5'>Manage categories</h2>
   <div className='category-form w-50'>
   <Form onSubmit={handleSubmit} className='my-5 border border-2 p-5 rounded shadow-lg'>
            <Form.Group controlId="categoryName">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                />
            </Form.Group>
            <Button className='category-submit-button'  type="submit">
                Submit
            </Button>
        </Form>
   </div>
   <div className='border border-3 rounded ' >
   {categoryList.map((category)=>category?.name ? <span key={category._id} onClick={()=>handleCategoryClick(category)} className='category-item'>{category.name}</span>:"")}
   </div>
   {modal && <ModalComponent setModal={setModal} selectedCategory={selectedCategory} updatedCategoryHnadler={updatedCategoryHnadler}/>}

</Container>
  
   </>
  )
}

export default CategoryList