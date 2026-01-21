'use client'
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { GroceryItem } from "../types/grocery";
import {motion} from 'motion/react'
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { addToCart, decreaseQuantity, increaseQuantity } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";


function GroceryItemCard({item}: {item: GroceryItem}) {

    const dispatch = useAppDispatch();
    const {cartData} = useAppSelector(state=> state.cart);
    const {userData} = useAppSelector(state => state.user)

    const cartitem = cartData.find(i=>i.id === item.id);

    const handleAddToCart = async () => {
    try {
        dispatch(addToCart({
        ...item, 
        createdAt: item.createdAt.toISOString(), 
        updatedAt: item.updatedAt.toISOString(), 
        quantity: 1
    }));

    const response = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ userId: userData?.id, groceryId: item.id, action: 'ADD' })
    });

    const data = await response.json();
    if(!response.ok){
        toast.error(`${data.message}`)
    }
    toast.success("item added to cart")
    } catch (error) {
        toast.error("something went wrong while adding to cart")
    }
};

const handleQuantity = async (id: string, action: 'INC' | 'DEC') => {
    if (!userData?.id) return toast.error("Please login");

    const currentQty = cartitem?.quantity || 0;
    const nextQty = action === 'INC' ? currentQty + 1 : currentQty - 1;

    if (action === 'INC') dispatch(increaseQuantity(id));
    else dispatch(decreaseQuantity(id));

    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ 
                userId: userData.id, 
                groceryId: id, 
                quantity: nextQty, 
                action: 'SET' 
            })
        });

        if (!response.ok) throw new Error();
    } catch (error) {
        toast.error("Sync failed. Check your connection.");
    }
};

    const formatCategoryName = (name: string) => {
        return name
            .toLowerCase()
            .split('_')
            .map(word => {
                if (word === 'and') return '&';
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    };
  return (
    <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: false, amount:0.3 }}
    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
    >
        <div className="relative w-full aspect-4/3 bg-gray-50 overflow-hidden group">
            <Image src={item.image} alt={item.name} fill sizes= '(max-width:786px) 100vw, 25vw' className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"/>
            <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
        </div>
        <div className="p-4 flex flex-col flex-1">
            <p className="text-sm text-gray-500 font-medium pl-1">{formatCategoryName(item.category)}</p>
            <h3 className="text-gray-700 font-semibold text-md p-1 mt-1">{item.name}</h3>

            <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{item.unit}</span>
                <span className="text-teal-700 font-bold text-lg">₹{item.price}</span>
            </div>

            {!cartitem ? <motion.button className="mt-4 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full py-2 text-sm font-medium transition-all cursor-pointer"
            whileTap={{scale: 0.96}}
            onClick={handleAddToCart}
            >
                <ShoppingCart />
                Add to Cart
            </motion.button> : 
            <motion.div 
            initial={{opacity:0, y:10}}
            animate={{opacity:1, y:0}}
            transition={{duration:0.3}}
            className="mt-4 flex items-center justify-center bg-teal-50 border border-teal-200 rounded-full py-2 px-4 gap-4"
            >

                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-100 hover:bg:teal-200 transition-all" onClick={()=>handleQuantity(item.id, "DEC")}><Minus size={18} className="text-teal-700" /></button>
                <span className="text-sm font-semibold text-gray-800">{cartitem.quantity}</span>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-100 hover:bg:teal-200 transition-all" onClick={()=>handleQuantity(item.id, "INC")}><Plus size={18} className="text-teal-700"/></button>

            </motion.div>
            }

        </div>

    </motion.div>
  )
}

export default GroceryItemCard