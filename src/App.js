
import './App.css';
import Toast from './components/Toast'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './pages/common/Sidebar';
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import Cart from './pages/user/Cart';
import Favorites from './pages/user/Favorites';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import Profile from './pages/user/Profile';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import UsersList from './pages/admin/UsersList';
import CategoryList from './pages/admin/CategoryList';

import ProductCreate from './pages/admin/ProductCreate';
import ProductsAll from './pages/admin/ProductsAll';
import ProductUpdate from './pages/admin/ProductUpdate';
import SingleProduct from './components/SingleProduct';
import CategoryListProducts from './pages/user/CategoryListProducts';
import ShippingForm from './components/orders/ShippingForm';
import PlaceOrder from './components/orders/PlaceOrder';

import PymentFailurePage from './components/orders/PymentFailurePage';
import PymentSuccessPage from './components/orders/PymentSuccessPage';
import Orders from './pages/user/Orders';
import AdminOrder from './pages/admin/AdminOrder';
import LoginRoute from './components/LoginRoute';

function App() {
  return (
    <>

      <BrowserRouter>

        <Routes>
       
          <Route path="/" element={<Sidebar />}>
          <Route index element={<Home />} />
          
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
<Route path="/product/:id" element={<SingleProduct/>}/>
<Route path="/cart" element={<Cart/>}/>
<Route path="/singlecategorypdts/:id" element={<CategoryListProducts/>}/>
         <Route path="/shipping" element={<ShippingForm/>}/> 
         <Route path="/placeorder" element={<PlaceOrder/>}/>
          
          <Route path="/success/:id" element={<PymentSuccessPage/>}/>
          <Route path="/failure" element ={<PymentFailurePage/>}/>
          <Route path="orders" element={<Orders/>}/>
            </Route>
           
           

<Route path="/admin" element={<AdminRoute/>}>
<Route path="users" element={<UsersList/>}/>
<Route path="orders" element={<AdminOrder/>}/>
<Route path="category" element={<CategoryList/>}/>
<Route path="products" element={<ProductsAll/>}/>
<Route path="createproduct" element={<ProductCreate/>}/>
<Route path="updateproducts/:id" element={<ProductUpdate/>}/>
</Route>
<Route path="/" element={<LoginRoute/>}>
<Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
</Route>
         

          </Route>
        </Routes>
      </BrowserRouter>
      <Toast />
    </>
  )
}

export default App;
