import { configureStore } from '@reduxjs/toolkit'
import userSlice from "./slices/userSlice"
import cartSlice from "./slices/cartSlice"
import categorySlice from "./slices/categorySlice"



export const store = configureStore({
  reducer: {
    user: userSlice,
    cart: cartSlice,
    category: categorySlice
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch