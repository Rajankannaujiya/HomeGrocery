import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {CartType, Category} from "../../types/grocery"


interface CategorySliceType {
    selectedCategory: Category | null;
}

const initialState: CategorySliceType ={
    selectedCategory: null
}

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        selectCategroy(state, actions:PayloadAction<Category | null>){
            state.selectedCategory = actions.payload;
        },
        clearCategory(state){
            state.selectedCategory = null
        }
    }
})

export const {selectCategroy, clearCategory} = categorySlice.actions;
export default categorySlice.reducer;