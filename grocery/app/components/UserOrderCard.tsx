import { Banknote, ChevronDown, ChevronUp, CreditCard, MapPin, Package, Truck, UserCheck } from "lucide-react";
import { OrderStatus, OrderType } from "../types/order";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getSocket } from "@/lib/websocket";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { useRouter } from "next/navigation";

type userOrderCardProps = {
  order: OrderType;
};

function UserOrderCard({ order }: userOrderCardProps) {

  const {userData} = useAppSelector(state=> state.user);
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(order.status)
  const router = useRouter();
 useEffect(() => {
    const socket = getSocket(dispatch, userData);
    
    if (!socket) {
        console.log("WebSocket not initialized yet.");
        return;
    }

    const handleMessage = (event: any) => {
      console.log("event in the deliveryboy",event);
        try {
            if (typeof event.data === 'string' && event.data.startsWith('Welcome')) return;

            const payload = JSON.parse(event.data);
            if(payload.type ==="order-status-update" && payload.data.orderId === order.id){
              setStatus(payload.data.status);
            }
        } catch (err) {
            console.error("Parsing error:", err);
        }
    };

    const onOpen = () => console.log("✅ Socket Connected to Server");
    const onClose = () => console.log("❌ Socket Disconnected");
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('open', onOpen);
    socket.addEventListener('close', onClose);
    
    return () => {
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('close', onClose);
    };
}, [userData, status]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "OUT_OF_DELIVERY":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-teal-100 text-teal-700 border-teal-300";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-orange-100 text-orange-700 border-orange-300";
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-teal-50 to-white">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order <span className="text-teal-700">#{order.id}</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "N/A"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusStyles(
              order.paymentStatus
            )}`}
          >
            {order.paymentStatus}
          </span>
          <span
            className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {order.paymentMethod === "COD" ?
            <div className="flex items-center gap-2 text-gray-700">
              <Banknote size={16} className="text-t3eal-600"/>
               Cash On Delivery
            </div> 
            : 
            <div className="flex items-center gap-2 text-gray-700">
              <CreditCard size={16} className="text-teal-600"/>
               Online Payment
            </div> 
        }


{order.deliveryAssignments &&
            order.deliveryAssignments?.length !== 0 && order.status === "OUT_OF_DELIVERY"  && (
              <>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <UserCheck className="text-blue-600" size={18} />
                  <div className="font-semibold text-gray-800">
                    <p>
                      Assigned to:{" "}
                      <span>
                        {order.deliveryAssignments[0].assignedTo?.name.toUpperCase() ||
                          "Pending..."}
                      </span>
                    </p>
                    {order.deliveryAssignments[0].assignedTo?.mobile && (
                      <p>
                        📞 +91{order.deliveryAssignments[0].assignedTo.mobile}
                      </p>
                    )}
                  </div>
                </div>
                <a href={`tel:${order.deliveryAssignments[0].assignedTo?.mobile}`} className="bg-blue-600 text-white text-sx px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"> Call</a>
              </div>
                <button className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-teal-700 transition"
                onClick={()=>router.push(`/user/track-order/${order.id}`)}
                ><Truck size={18}/> Track Your Order</button>
                </>
              
            )}

        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <MapPin size={16} className="text-teal-600"/>
          <span className="truncate">{order.address.fullAddress}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
        <button 
        onClick={()=>setExpanded(prev=>!prev)}
        className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition">
          <span className="flex items-center gap-2">
            <Package className="text-teal-600"/>
            {expanded ? "Hide Order Items" : `View ${order.items.length} items`}
          </span>

          {expanded ? <ChevronUp className="text-teal-600"/> : <ChevronDown className="text-teal-600"/>}
        </button>

        <motion.div
        initial={{height:0, opacity:0}}
        animate={{
          height: expanded ? "auto" : 0,
          opacity: expanded ? 1 : 0
        }}

        transition={{duration:0.3}}
        className="overflow-hidden"
        >
          <div className="mt-3 space-y-3">
            {
              order.items.map((item, index)=>(
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray100 transition">
                  <div className="flex items-center gap-3">
                    {item.image && <Image src={item.image} width={48} height={48} alt={item.name}  className="w-12 h-12 rounded-lg object-cover border border-gray-200"/>}

                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                  </div>
                  
                  <p className="text-sm font-semibold text-teal-800">₹{Number(item.price)*item.quantity}</p>
                </div>
              ))
            }
          </div>
        </motion.div>
        </div>

        <div className="border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800">
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <Truck size={16} className="text-teal-600"/>
              <span>Delivery: <span className="text-teal-700 font-bold">{status}</span></span>
            </div>
            <div>
              Total: <span className="text-teal-700 font-bold">₹{order.totalAmount}</span>
            </div>
        </div>

      </div>
    </motion.div>
  );
}

export default UserOrderCard;
