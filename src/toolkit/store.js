import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice'
import favoriteReducer from './favoriteSice'
import cartReducer from './cartSlice'
import shopReducer from './shopSlice'
export const store= configureStore({
    reducer:{
        auth:authReducer,
        favorites:favoriteReducer,
        cart: cartReducer,
        shop:shopReducer
    }
})
