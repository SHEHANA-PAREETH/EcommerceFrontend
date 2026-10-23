import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../api/client'

const read = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback } catch { return fallback }
}
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode: the cart simply isn't remembered */ } }

// ---------- auth: the session lives in an httpOnly cookie; this only mirrors who is signed in ----------
export const loadSession = createAsyncThunk('auth/load', async () => {
  try { return (await client.get('/users/session')).data } catch { return null }
})

const auth = createSlice({
  name: 'auth',
  initialState: { user: null, ready: false },
  reducers: {
    setUser: (state, { payload }) => { state.user = payload },
    clearUser: (state) => { state.user = null },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSession.fulfilled, (state, { payload }) => { state.user = payload; state.ready = true })
  },
})

// ---------- cart: only what is needed to show a line; the server re-reads prices when the order is placed ----------
const MAX_QTY = 10
const lineOf = (p) => ({ _id: p._id, name: p.name, image: p.image, brand: p.brand, price: p.price, mrp: p.mrp, countInStock: p.countInStock })
const cart = createSlice({
  name: 'cart',
  initialState: { items: read('shop:cart', []), address: read('shop:address', null) },
  reducers: {
    addItem: (state, { payload: { product, qty = 1 } }) => {
      const limit = Math.min(MAX_QTY, product.countInStock)
      const found = state.items.find((item) => item._id === product._id)
      if (found) { Object.assign(found, lineOf(product), { qty: Math.min(limit, found.qty + qty) }) }
      else state.items.push({ ...lineOf(product), qty: Math.min(limit, qty) })
      save('shop:cart', state.items)
    },
    setQty: (state, { payload: { id, qty } }) => {
      const found = state.items.find((item) => item._id === id)
      if (found) found.qty = Math.max(1, Math.min(MAX_QTY, found.countInStock, qty))
      save('shop:cart', state.items)
    },
    removeItem: (state, { payload }) => { state.items = state.items.filter((item) => item._id !== payload); save('shop:cart', state.items) },
    clearCart: (state) => { state.items = []; save('shop:cart', []) },
    saveAddress: (state, { payload }) => { state.address = payload; save('shop:address', payload) },
    // keep the cart in step with the catalogue (price changes, sold out items)
    refreshItems: (state, { payload }) => {
      const byId = new Map(payload.map((p) => [p._id, p]))
      state.items = state.items.filter((item) => byId.has(item._id)).map((item) => {
        const fresh = byId.get(item._id)
        return { ...item, ...lineOf(fresh), qty: Math.max(1, Math.min(item.qty, fresh.countInStock || 1)) }
      })
      save('shop:cart', state.items)
    },
  },
})

// ---------- wishlist: product ids in the browser ----------
const wishlist = createSlice({
  name: 'wishlist',
  initialState: { ids: read('shop:wishlist', []) },
  reducers: {
    toggleWish: (state, { payload }) => {
      state.ids = state.ids.includes(payload) ? state.ids.filter((id) => id !== payload) : [payload, ...state.ids]
      save('shop:wishlist', state.ids)
    },
    clearWishlist: (state) => { state.ids = []; save('shop:wishlist', []) },
  },
})

export const { setUser, clearUser } = auth.actions
export const { addItem, setQty, removeItem, clearCart, saveAddress, refreshItems } = cart.actions
export const { toggleWish, clearWishlist } = wishlist.actions

export const store = configureStore({ reducer: { auth: auth.reducer, cart: cart.reducer, wishlist: wishlist.reducer } })

export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0)
