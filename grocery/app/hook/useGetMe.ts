'use client'

import { useEffect } from "react"
import { setUserData } from "../redux/slices/userSlice";
import {useAppDispatch} from "../redux/hook"

const useGetMe = () => {
    const dispatch = useAppDispatch();
  useEffect(()=>{
    const getMe = async()=>{
        try {
            const response = await fetch("/api/me",{
                method: "GET",
            })
            const data = await response.json();
            console.log(data)
            if(!response.ok){
                return;
            }
            dispatch(setUserData(data))
        } catch (error) {
            console.log(error);
        }
    }
    getMe()
  },[])
}

export default useGetMe