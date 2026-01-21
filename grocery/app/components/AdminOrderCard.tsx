import React, { ChangeEvent, useEffect, useState } from "react";
import { OrderStatus, OrderType } from "../types/order";
import { motion } from "motion/react";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

const AdminOrderCard = ({ order }: { order: OrderType }) => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<OrderStatus>("PENDING");

  useEffect(()=>{
    setStatus(order.status);
  },[order])

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

  const updateStatus = async (orderId: string, status: string) => {
    try {
      console.log(status);
      const response = await fetch(
        `/api/admin/update-order-status/${orderId}`,
        {
          method: "POST",
          body: JSON.stringify({ status: status }),
        }
      );
      const data = await response.json();

      console.log(data);
      if (!response.ok) {
        toast.error(`${data.message}`);
        return;
      }
      setStatus(status as OrderStatus);

      console.log("update status", data);
    } catch (error) {
      console.log(error);
    }
  };

  const StatusOption = ["PENDING", "PROCESSING", "OUT_OF_DELIVERY"];

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* LEFT COLUMN: Order Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-teal-700" />
            <h3 className="text-lg font-semibold text-gray-800">
              Order <span className="text-teal-700">#{order.id}</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusStyles(
                order.paymentStatus
              )}`}
            >
              {order.paymentStatus}
            </span>
            <p className="text-sm text-gray-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div className="text-gray-700 text-sm space-y-2">
            <p className="flex items-center gap-2 font-medium">
              <User size={16} className="text-teal-600" />
              <span>{order.address.fullName}</span>
            </p>
            <p className="flex items-center gap-2 font-medium">
              <Phone size={16} className="text-teal-600" />
              <span>{order.address.mobile}</span>
            </p>
            <p className="flex items-center gap-2 font-medium">
              <MapPin size={16} className="text-teal-600" />
              <span>{order.address.fullAddress}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold pt-1">
            {order.paymentMethod === "COD" ? (
              <>
                <Banknote size={16} className="text-teal-600" /> Cash On
                Delivery
              </>
            ) : (
              <>
                <CreditCard size={16} className="text-teal-600" /> Online
                Payment
              </>
            )}
          </div>

          {order.deliveryAssignments &&
            order.deliveryAssignments?.length !== 0 && (
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
                </>
              
            )}
        </div>

        {/* RIGHT COLUMN: Status and Controls */}
        <div className="flex flex-col items-start md:items-end gap-3 min-w-37.5">
          <span
            className={`px-3 py-1 text-xs font-bold border rounded-full ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>

          {order.status !== "DELIVERED" && <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
              Update Status
            </label>
            <select
              defaultValue={status}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-teal-400 transition focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
              onChange={(e) => updateStatus(order.id, e.target.value)}
            >
              {StatusOption.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>}

          <div className="text-right mt-2">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-teal-800">
              ₹{order.totalAmount}
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Expandable Items (Full Width) */}
      <div className="border-t border-gray-300 mt-4 pt-3">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex justify-between items-center text-sm font-medium text-gray-600 hover:text-teal-700 transition"
        >
          <span className="flex items-center gap-2">
            <Package size={18} className="text-teal-700" />
            {expanded ? "Hide Order Items" : `View ${order.items.length} items`}
          </span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="mt-4 space-y-3 p-2">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <Image
                      src={item.image}
                      width={48}
                      height={48}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-teal-800">
                  ₹{Number(item.price) * item.quantity}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminOrderCard;
