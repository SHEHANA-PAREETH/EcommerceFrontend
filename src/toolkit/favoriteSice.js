import {createSlice} from "@reduxjs/toolkit"




const initialState = {
    favoriteProducts:JSON.parse( localStorage.getItem("favorites"))||[], 
    // Initial state is an empty array
    count:0 || JSON.parse( localStorage.getItem("count")),
  };
  
  const favoriteSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
      addToFavorites: (state, action) => {
        // Add the product ID to the favoriteProducts array
       const favorites =  JSON.parse( localStorage.getItem("favorites"))
      
if (!favorites?.includes(action.payload)) {
  state.favoriteProducts.push(action.payload);
        localStorage.setItem("favorites",JSON.stringify(state.favoriteProducts))
}
        
      },
      removeFromFavorites: (state, action) => {
        // Remove the product ID from the favoriteProducts array
        state.favoriteProducts = state.favoriteProducts.filter(
          id => id !== action.payload
        );
        localStorage.setItem("favorites",JSON.stringify(state.favoriteProducts))
      },
      incrementCount:(state,action)=>{
        state.count = action.payload
        localStorage.setItem("count",state.count)
      }
    },
  });
export const {addToFavorites,removeFromFavorites,incrementCount} = favoriteSlice.actions;
export default favoriteSlice.reducer