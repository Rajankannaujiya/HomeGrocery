"use client"

import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash } from "lucide-react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useAppDispatch, useAppSelector } from "@/app/redux/hook"
import Image from "next/image"
import { decreaseQuantity, increaseQuantity, removeFromCart } from "@/app/redux/slices/cartSlice"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

const CartPage = () => {
  const dispatch = useAppDispatch();
  const { cartData, subTotal, deliveryFee, finalTotal } = useAppSelector(state => state.cart);
  const { userData } = useAppSelector(state => state.user); 
  const router = useRouter();

  const syncCartToDB = async (groceryId: string, nextQty: number, action: string) => {
    if (!userData?.id) return;
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          groceryId,
          quantity: nextQty,
          action: action === "DELETE" ? "DELETE" : "SET"
        })
      });

      const data = await response.json()
      if(!response.ok){
        toast.error(`${data.message}`)
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to sync cart with server");
    }
  };

  const handleUpdateQuantity = (id: string, currentQty: number, change: 'INC' | 'DEC') => {
    const nextQty = change === 'INC' ? currentQty + 1 : currentQty - 1;

    if (change === 'INC') dispatch(increaseQuantity(id));
    else dispatch(decreaseQuantity(id));

    syncCartToDB(id, nextQty, "SET");
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
    syncCartToDB(id, 0, "DELETE");
    toast.success("Item removed");
  };

  return (
    <div className="w-[95%] sm:w-[80%] mx-auto mt-8 mb-24 relative">
      <Link href={"/"} className="absolute top-2 left-0 flex items-center gap-2 text-teal-700">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to home</span>
      </Link>

      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-700 text-center mb-10">
        Your Shopping Cart
      </motion.h2>

      {cartData.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white rounded-2xl shadow-md">
          <ShoppingBasket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-6">Your Cart is Empty.</p>
          <Link href={"/"} className="bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700 inline-block">Continue Shopping</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence>
              {cartData.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow-md p-5 border border-gray-100">
                  
                  <div className="relative w-28 h-28 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-3" />
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{item.unit}</p>
                    <p className="text-teal-700 font-bold mt-1 text-sm sm:text-base">₹{parseFloat(item.price) * item.quantity}</p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-3 mt-3 sm:mt-0 bg-gray-50 py-2 px-4 rounded-full">
                    <button 
                      className="bg-white p-1.5 rounded-full hover:bg-teal-100 transition-all border" 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 'DEC')}
                    >
                      <Minus size={18} className="text-teal-700" />
                    </button>
                    <span className="font-semibold text-gray-800 w-6 text-center">{item.quantity}</span>
                    <button 
                      className="bg-white p-1.5 rounded-full hover:bg-teal-100 transition-all border" 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 'INC')}
                    >
                      <Plus size={18} className="text-teal-700" />
                    </button>
                  </div>

                  <button className="sm:ml-4 sm:mt-0 mt-4 text-red-500 hover:text-red-700" onClick={() => handleRemove(item.id)}>
                    <Trash size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ORDER SUMMARY */}
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
              <hr />
              <div className="flex justify-between font-bold text-lg"><span>Final Total</span><span className="text-teal-700">₹{finalTotal}</span></div>
            </div>
            <button 
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-full hover:bg-teal-700 font-semibold"
              onClick={() => router.push("/user/checkout")}
            >
              Proceed to Checkout
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default CartPage;