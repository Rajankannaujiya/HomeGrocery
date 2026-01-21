import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {CartType} from "../../types/grocery"


interface CartSliceType {
    cartData: CartType[];
    subTotal: number;
    deliveryFee: number;
    finalTotal: number;
}

const initialState: CartSliceType ={
    cartData: [],
    subTotal:0,
    deliveryFee: 40,
    finalTotal: 40
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action: PayloadAction<any[]>) => {
    state.cartData = action.payload.map((item) => ({
      ...item.grocery,
      id: item.groceryId, 
      quantity: item.quantity,
    }));
    
    cartSlice.caseReducers.calculateTotals(state);
  },
        addToCart: (state, action: PayloadAction<CartType>)=>{
            state.cartData.push(action.payload);
            cartSlice.caseReducers.calculateTotals(state);
        },

        increaseQuantity: (state, action:PayloadAction<string>)=>{
            const item = state.cartData.find(i=>i.id === action.payload);
            if(item) {
                item.quantity = item.quantity + 1;
            }
            cartSlice.caseReducers.calculateTotals(state);
        },

        decreaseQuantity: (state, action:PayloadAction<string>)=>{
            const item = state.cartData.find(i=>i.id === action.payload);
            if(item && item?.quantity && item.quantity >1) {
                item.quantity = item.quantity - 1;
            }else{
              state.cartData = state.cartData.filter(i=>i.id !== action.payload)  
            }   

            cartSlice.caseReducers.calculateTotals(state);
        },

        removeFromCart: (state, action:PayloadAction<string>)=>{
            state.cartData = state.cartData.filter(i=>i.id !== action.payload);
            cartSlice.caseReducers.calculateTotals(state);
        },

        calculateTotals: (state) => {
        const sub = state.cartData.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        state.subTotal = sub;
        state.deliveryFee = sub > 400 || sub === 0 ? 0 : 40;
        state.finalTotal = state.subTotal + state.deliveryFee;
    }
    }
})

export const {addToCart, increaseQuantity, decreaseQuantity, removeFromCart, setCart} = cartSlice.actions;
export default cartSlice.reducer;