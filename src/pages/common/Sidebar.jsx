import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { FaHome } from "react-icons/fa";
import { CiShoppingCart } from "react-icons/ci";
import { MdFavorite } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { FaBagShopping } from "react-icons/fa6";
import { CiUser } from "react-icons/ci";
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../constants';
import axios from 'axios';
import { Badge } from 'react-bootstrap';
import { ToastSuccess } from '../../plugins/toast';
import { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { cartItems } from '../../toolkit/cartSlice';
function Sidebar() {
const {cartItems} = useSelector((state)=>state.cart)
  const userInfo = useSelector((state)=>state.auth)
 const count = useSelector((state)=>state.favorites.count)
  console.log(userInfo);
  const navigate = useNavigate()
axios.defaults.withCredentials = true;
  const handleLogout=async()=>{
 
    try{
      const resp= await axios.post(`${BASE_URL}/api/users/logout`)
      console.log(resp);
      if(resp.data.msg && resp.data.msg === "logout successfully"){
        localStorage.clear()
        ToastSuccess("logout successfully")
      navigate("/login")
        window.location.reload()

      }
    }
    catch(error){
console.log(error);
    }
  
  }
  return (
    <>
     
        <Navbar  expand="false" className="bg-body-tertiary mb-3" >
          <Container fluid >
            
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-false`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-false`}
              aria-labelledby={`offcanvasNavbarLabel-expand-false`}
              placement="start"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-false`} className='fs-2 text-uppercase'>
                  {userInfo && userInfo?.userInfo?.username}
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body className='d-flex flex-column justify-content-between'>
               
                  <div>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                  <Nav.Link href="/"><FaHome className='me-4' size={26}/>Home</Nav.Link>
                  <Nav.Link href="/shop"><FaBagShopping className='me-4' size={26}/>Shop</Nav.Link>
                  <Nav.Link href="/orders"><FaBagShopping className='me-4' size={26}/>Orders</Nav.Link>
                  <Nav.Link href="/cart">
                  <CiShoppingCart className='position-relative' size={26}/>
                {cartItems?.length > 0 &&<span class="position-absolute   translate-middle badge rounded-pill bg-danger">
                     {cartItems.reduce((acc,item)=>acc+Number(item.qty),0)}
                      </span> }
                
<span className='ms-4'>Cart</span>
</Nav.Link>
                  <Nav.Link href="/favorites" >
                
                    <MdFavorite className='  position-relative' size={26}/>
                    <span class="position-absolute   translate-middle badge rounded-pill bg-danger">
                         {count}
                          </span>
    <span className='ms-4'>Favorites</span>
    </Nav.Link>
                    
                 {userInfo?.userInfo?.isAdmin && <Dropdown>
      <Dropdown.Toggle variant="info mb-3" id="dropdown-basic">
        Admin Dashboard
      </Dropdown.Toggle>

      <Dropdown.Menu>
        
        <Dropdown.Item href="/admin/products">Products</Dropdown.Item>
        <Dropdown.Item href="/admin/category">Category</Dropdown.Item>
        <Dropdown.Item href="/admin/orders">Orders</Dropdown.Item>
        <Dropdown.Item href="/admin/users">Users</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>}
                  
                </Nav>
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Search"
                    className="me-2"
                    aria-label="Search"
                  />
                  <Button variant="outline-success">Search</Button>
                </Form>
                  </div>
                  <div>
                    {userInfo.userInfo ?  <Nav.Link onClick={handleLogout}><IoIosLogOut  className='me-4' size={26}/>Logout</Nav.Link>:<Nav.Link href="/login"><IoIosLogOut  className='me-4' size={26}/>Login</Nav.Link>}
                  
                <Nav.Link href="/profile"><CiUser  className='me-4' size={26}/>Profile</Nav.Link>
                  </div>
                
             
              </Offcanvas.Body>
            </Navbar.Offcanvas>
            <Navbar.Brand href="#">PRODUCT STORE</Navbar.Brand>
          </Container>
        </Navbar>
    <Outlet/>
    </>
  );
}

export default Sidebar;