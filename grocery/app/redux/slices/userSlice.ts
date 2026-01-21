import { createSlice } from "@reduxjs/toolkit";
import {UserType} from "../../types/user"


interface UserSliceType {
    userData: UserType | null;
    connectedToWs: boolean;
}

const initialState: UserSliceType ={
    userData: null,
    connectedToWs: false,

}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData: (state, action)=>{
            state.userData = action.payload;
        },
        setConnected: (state) => {
            state.connectedToWs = true;
        },
        setDisconnected: (state) => {
            state.connectedToWs = false;
        },
    }
})

export const {setUserData, setConnected, setDisconnected} = userSlice.actions;
export default userSlice.reducer;