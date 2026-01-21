"use client"
import AdminOrderCard from '@/app/components/AdminOrderCard';
import { useAppDispatch, useAppSelector } from '@/app/redux/hook';
import { OrderType } from '@/app/types/order';
import { getSocket } from '@/lib/websocket';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

function ManageOrders() {

    const [orders, setorder] = useState<OrderType[]>([]);
    const [orderLoading, setOrderLoading] = useState(true);
    const router = useRouter()

    const dispatch = useAppDispatch();
        const { userData } = useAppSelector((state) => state.user);

    useEffect(()=>{
        const getOrders = async()=>{
            setOrderLoading(true);
            try {
                const response = await fetch("/api/admin/get-orders",{
                    method: "GET"
                })

                const data = await response.json();
                setOrderLoading(false);
                if(!response.ok){
                    toast.error(`error while getting data ${data}`)
                    return
                }
                setorder(data)
                
            } catch (error) {
                console.log(error)
                setOrderLoading(false)
            }
        }
        getOrders()
    },[])

useEffect(() => {
    const socket = getSocket(dispatch, userData);
    const handleMessage = (event:any) => {
        try {
        if (typeof event.data === 'string' && event.data.startsWith('Welcome')) {
            return; 
        }
            const payload = JSON.parse(event.data);
            if (payload.type === "new-order") {
                setorder((prev)=> [payload.data, ...prev])
            }
        } catch (err) {
            console.log("Error parsing socket message:", err);
            toast.error("something wrong with websocket")
        }
    };

    socket?.addEventListener("message", handleMessage);

    return () => {
        socket?.removeEventListener("message", handleMessage);
    };
}, []);

  return (
    <div className='min-h-screen bg-gray-50 w-full'>
        <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
            <div className='max-w-3xl mx-auto flex items-center gap-4 px-4 py-3'>
            <button className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-all' onClick={()=>router.push("/")} >
              <ArrowLeft size={24} className='text-teal-700'/>
            </button>

            <h1 className='text-xl font-bold text-gray-800'> Manage Orders</h1>
          </div>
        </div>
        
        <div className='max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8'>
            <div className='space-y-6'>
            {orders.map((order, index)=>(
                <AdminOrderCard key={index} order={order} />
            ))}

        </div>
        </div>
    </div>
  )
}

export default ManageOrders