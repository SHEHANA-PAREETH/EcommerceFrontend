import {createSlice} from '@reduxjs/toolkit'
import { updateCart } from './cart'
const INITIAL_STATE= localStorage.getItem('cart') ? JSON.parse(localStorage.getItem("cart")):
{cartItems:[],shippingAddress:{},paymentMethod:"stripe"}
const cartSlice = createSlice({
    name:"cart",
    initialState:INITIAL_STATE,
    reducers:{
        addToCart:(state,action)=>{
           
            const existItem = state.cartItems.find((x)=>  x._id === action.payload._id)
if(existItem){
    state.cartItems = state.cartItems.map((x)=>x._id === action.payload._id ? action.payload : x)
}else{
    const {user,rating,numReviews,reviews,...item} = action.payload
    state.cartItems = [...state.cartItems,item]
}
return updateCart(state)
        },
       
        


        removeFromCart:(state,action)=>{
            state.cartItems = state.cartItems.filter((x)=>x._id !== action.payload)
            return updateCart(state)
        },

        saveShippingAddress :(state,action)=>{
            state.shippingAddress = action.payload
            localStorage.setItem('cart',JSON.stringify(state))
        },
        savePaymentMethod :(state,action)=>{
            state.paymentMethod = action.payload
            localStorage.setItem('cart',JSON.stringify(state))
        },
        clearCartItems :(state,action)=>{
           state.cartItems = []
            localStorage.setItem('cart',JSON.stringify(state))
        },
        resetCart :(state) =>(state = INITIAL_STATE)//data retrieve again loging in
            
    
    }
})
export const {clearCartItems,addToCart,removeFromCart,savePaymentMethod,saveShippingAddress,cartItems,resetCart} = cartSlice.actions
export default cartSlice.reducer