"use client"
import { ArrowLeft, Loader, PackageSearch } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OrderType } from '@/app/types/order'
import {motion} from "motion/react"
import UserOrderCard from '@/app/components/UserOrderCard'

const MyOrder = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>();
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const getMYOrders = async ()=>{
      try {
        const response = await fetch("/api/user/my-orders", {
          method: "GET"
        });

        const data = await response.json();

        if(!response.ok){
          toast.error(`error while getting orders ${data.error}`);
          setLoading(false)
          return;
        }
        setLoading(false)
        setOrders(data)
      } catch (error) {
        console.log(error)
        setLoading(false)
          toast.error("error while getting orders");
          return
      }
    }

    getMYOrders()
  },[])


  if(loading){
      return <div className='flex justify-center items-center min-h-screen text-teal-600'>
        <Loader className='w-8 h-8 animate-spin'/>
      </div>
  }
  return (
    <div className='bg-linear-to-b from-white to-gray-100 min-h-screen w-full'>
      <div className='max-w-3xl mx-auto px-4 pt-16 pb-10 relative'>
        <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
          <div className='max-w-3xl mx-auto flex items-center gap-4 px-4 py-3'>
            <button className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-all' onClick={()=>router.push("/")} >
              <ArrowLeft size={24} className='text-teal-700'/>
            </button>

            <h1 className='text-xl font-bold text-gray-800'> My Orders</h1>
          </div>

        </div>

        {orders?.length === 0 ? (<div className='pt-20 flex flex-col items-center text-center'>
          <PackageSearch size={70} className='text-teal-600 mb-4'/>
          <h2 className='text-xl font-semibold text-gray-700'>No order found</h2>
          <p className='text-gray-500 text-sm mt-1'>Start shopping to view your order here</p>
        </div>) : (<div className='mt-4 space-y-6'>
          {orders?.map((order, index )=> 
          <motion.div key={index}
          initial={{opacity:0, y:20}}
          animate={{opacity:1, y:20}}
          transition={{duration:0.4}}
          >
            <UserOrderCard order={order}/>
          </motion.div>)}
        </div>)}

      </div>
    </div>
  )
}

export default MyOrder