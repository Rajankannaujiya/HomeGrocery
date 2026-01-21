"use client"

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { setCart } from "@/app/redux/slices/cartSlice";

export default function CartInitializer() {
  const dispatch = useAppDispatch();
  const { userData } = useAppSelector((state) => state.user);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userData?.id) return;

      try {
        const response = await fetch(`/api/cart/${userData.id}`);
        if (response.ok) {
          const data = await response.json();
          dispatch(setCart(data));
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    fetchCart();
  }, [userData?.id, dispatch]);

  return null;
}