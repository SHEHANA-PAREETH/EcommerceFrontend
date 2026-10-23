import { useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import client from './api/client'
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

  // the session cookie is shared by every tab. When another tab signs in as someone else (or signs out), this tab
  // notices as soon as it is looked at again and reloads, so it never keeps acting as the old account.
  const { user, ready } = useSelector((state) => state.auth)
  const me = useRef(null)
  me.current = ready ? (user?._id || null) : undefined
  useEffect(() => {
    const recheck = async () => {
      if (document.visibilityState === 'hidden' || me.current === undefined) return
      try {
        const { data } = await client.get('/users/session')
        if ((data?._id || null) !== me.current) window.location.reload()
      } catch { /* offline: try again next time */ }
    }
    window.addEventListener('focus', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => { window.removeEventListener('focus', recheck); document.removeEventListener('visibilitychange', recheck) }
  }, [])

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
