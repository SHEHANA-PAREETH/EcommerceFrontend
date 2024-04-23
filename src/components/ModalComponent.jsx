import { useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import axios from 'axios';
import Swal from 'sweetalert2';
import { ToastSuccess } from '../plugins/toast';

function ModalComponent({setModal,selectedCategory,updatedCategoryHnadler}) {
    const [updatedValue, setUpdatedValue] = useState(selectedCategory.name);
axios.defaults.withCredentials = true
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(updatedValue);
       console.log(selectedCategory._id);
       const categoryId= selectedCategory._id 
       axios.put(`${process.env.REACT_APP_BASE_URL}/api/category/${categoryId}/`,{
        name:updatedValue
       }).then((res)=>{
        console.log(res);
        if(res.data){
          setModal(false)
          updatedCategoryHnadler(selectedCategory._id,updatedValue)
        }
       })
    };
   const handleDeleteHandler=()=>{
    Swal.fire({
      title: "Are you sure delete?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!"
    }).then((result)=>{
if(result){
 const categoryId= selectedCategory._id
axios.delete(`${process.env.REACT_APP_BASE_URL}/api/category/${categoryId}`).then((resp)=>{
  console.log(resp);
  if(resp.data){
    setModal(false)
    const value = null;
    updatedCategoryHnadler(selectedCategory._id,value)
    ToastSuccess("deleted successfully")
  }
})
}
    })
   }
  return (
    <div
      className="modal show "
      style={{ display: 'block', position:'absolute' ,top:"40%",}}
    >
      <Modal.Dialog>
        <Modal.Header closeButton onClick={()=>setModal(false)}>
          <Modal.Title>Update Category Name</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="updatedValue">
                <Form.Label>Updated Value</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter updated value"
                    value={updatedValue} 
                    onChange={(e) => setUpdatedValue(e.target.value)}
                />
            </Form.Group>
            <Button className='mt-3' type="submit" >
                Update
            </Button>
        </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteHandler}>Delete</Button>
          <Button variant="secondary" onClick={()=>setModal(false)}>Close</Button>
        
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

export default ModalComponent;