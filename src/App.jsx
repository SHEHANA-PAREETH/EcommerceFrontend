import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loadSession } from './store'
import { UiProvider } from './context/Ui'
import Layout, { GuestOnly, RequireAdmin, RequireAuth, ScrollTop } from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Account, { AuthPage, NotFound, Wishlist } from './pages/Account'
import AdminLayout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import { ProductForm, ProductList } from './pages/admin/Products'
import { AdminOrders, Categories, Users } from './pages/admin/Manage'

export default function App() {
  const dispatch = useDispatch()
  // find out who is signed in (the session cookie is checked by the server)
  useEffect(() => { dispatch(loadSession()) }, [dispatch])

  return (
    <BrowserRouter>
      <UiProvider>
        <ScrollTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<Product />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route element={<GuestOnly />}>
              <Route path="login" element={<AuthPage mode="login" />} />
              <Route path="register" element={<AuthPage mode="register" />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="order/:id" element={<OrderDetail />} />
              <Route path="account" element={<Account />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Route>
        </Routes>
      </UiProvider>
    </BrowserRouter>
  )
}
