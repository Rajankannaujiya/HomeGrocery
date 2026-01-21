"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { getSocket } from "@/lib/websocket";
import { useGeoUpdate } from "../hook/useGeoUpdate";
import { LocationType } from "../types/user";
import DeliveryChat from "./DeliveryChat";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function DeliveryBoyDashboard({ earning }: { earning: number }) {
  const { userData } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  const [deliveryAssignment, setDeliveryAssignment] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] =
    useState<LocationType | null>(null);

  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setverifyOtpLoading] = useState(false);

    const fetchDeliveryAssignment = async () => {
      try {
        const response = await fetch("/api/delivery/get-assignment", {
          method: "GET",
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          toast.error(`${data.message}`);
          return;
        }
        if (data.deliveryassignment) {
          setDeliveryAssignment(data.deliveryassignment);
        }
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchDeliveryAssignment();
  }, []);

useEffect(() => {
  const socket = getSocket(dispatch, userData);
  
  if (!userData?.id || !socket) return;

  socketRef.current = socket;

  const handleOpen = () => {
    const payload = {
      type: "identity",
      userId: userData.id,
    };
    console.log("Sending Identity Payload:", payload);
    socket.send(JSON.stringify(payload));
  };

  const handleMessage = (event: any) => {
    try {
      if (typeof event.data === "string" && event.data.startsWith("Welcome")) return;
      const payload = JSON.parse(event.data);
      console.log("Received payload:", payload.data);
      
      if (payload.type === "order-status-update" && payload.data.deliveryAssignment) {
        setDeliveryAssignment((prev) => [payload.data.deliveryAssignment, ...prev]);
      }
    } catch (err) {
      console.error("Parsing error:", err);
    }
  };
  if (socket.readyState === WebSocket.OPEN) {
    handleOpen();
  } else {
    socket.addEventListener("open", handleOpen);
  }

  socket.addEventListener("message", handleMessage);
  const handleCloseEvent = () => console.log("Socket closed");
  socket.addEventListener("close", handleCloseEvent);

  return () => {
    socket.removeEventListener("message", handleMessage);
    socket.removeEventListener("open", handleOpen);
    socket.removeEventListener("close", handleCloseEvent);
  };
}, [userData?.id, dispatch]); 

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch(
        `/api/delivery/assignment/${id}/accept-assignment`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return toast.error(`${data.message}`);
      }

      toast.success(`${data.message}`);
      fetchCurrentOrder();
    } catch (error) {
      console.log(error);
      toast.error(`server error to accept assignmet`);
    }
  };

  const handleReject = async(id: string, deliveryBoyId: string)=>{
    try {
      const response = await fetch(
        `/api/delivery/reject-assignment`,
        {
          method: "POST",
          body: JSON.stringify({daId: id, deliveryBoyId: deliveryBoyId})
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return toast.error(`${data.message}`);
      }

      toast.success(`${data.message}`);
      fetchDeliveryAssignment();
    } catch (error) {
      console.log(error);
      toast.error(`server error to reject assignmet`);
    }
  }

  const fetchCurrentOrder = async () => {
    try {
      const response = await fetch("/api/delivery/current-order", {
        method: "GET",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(`${data.message}`);
      }

      if (data.activeAssignment) {
        setActiveOrder(data.activeAssignment.order);
        const latitude = data.activeAssignment.order.address.latitude;
        const longitude = data.activeAssignment.order.address.longitude;
        setUserLocation({ latitude, longitude });
      }
    } catch (error) {
      toast.error("error while fetching current order");
      console.log("error while fetching current order", error);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, [userData]);

  useGeoUpdate((lat, lon) => {
    setDeliveryBoyLocation({ latitude: lat, longitude: lon });
  });

  useEffect(() => {
    const socket = socketRef.current;
    if (
      socket?.readyState === WebSocket.OPEN &&
      deliveryBoyLocation &&
      activeOrder?.userId
    ) {
      const locationPayload = {
        type: "update-deliveryBoy-location",
        userId: userData?.id,
        location: [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude],
        userIdOrder: activeOrder.userId,
      };

      socket.send(JSON.stringify(locationPayload));
      console.log("Location pushed to user:", activeOrder.userId);
    }
  }, [deliveryBoyLocation, activeOrder, userData]);

  const LiveMap = dynamic(() => import("./LiveMap"), {
    ssr: false,
    loading: () => (
      <div className="w-full h-125 bg-slate-100 animate-pulse flex items-center justify-center rounded-xl">
        <p className="text-slate-400 font-medium">Loading Live Map...</p>
      </div>
    ),
  });

  const sendOtp = async () => {
    try {
      setSendOtpLoading(true);
      const response = await fetch("/api/delivery/otp/send-otp", {
        method: "POST",
        body: JSON.stringify({ orderId: activeOrder.id }),
      });

      const data = await response.json();
      setSendOtpLoading(false);
      if (!response.ok) {
        toast.error(`${data.message}`);
        setShowOtpBox(false);
      }
      setShowOtpBox(true);
      toast.success(`${data.message}`);
    } catch (error) {
      console.log(error);
      setShowOtpBox(false);
      setSendOtpLoading(false);
      toast.error("unable to send otp");
    }
  };

  const verifyOtp = async () => {
    try {
      setverifyOtpLoading(true);
      const response = await fetch("/api/delivery/otp/verify-otp", {
        method: "POST",
        body: JSON.stringify({ orderId: activeOrder.id, otp: otp }),
      });

      const data = await response.json();
      setverifyOtpLoading(false);
      if (!response.ok) {
        toast.error(`${data.message}`);
      }
      setActiveOrder(null);
      setOtp("");
      toast.success(`${data.message}`);
    } catch (error) {
      console.log(error);
      setverifyOtpLoading(false);
      toast.error("unable to verify otp");
    }
  };

  if (!activeOrder && deliveryAssignment.length === 0) {
    const todayEarning = [
      {
        name: "Today",
        earning,
        deliveries: Math.floor(earning / 40),
      },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-white to-teal-50 p-6">
        <div className="max-w-lg w-full text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-4">
            <span className="text-4xl">🚚</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            No Active Deliveries
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            You're currently offline or waiting. Stay active to receive new
            orders!
          </p>
        </div>

        {/* Chart Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-teal-900/5 p-8 w-full max-w-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-700 text-lg">
              Today's Performance
            </h3>
          </div>

          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={todayEarning}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#f0fdfa" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "20px" }}
                />
                <Bar
                  dataKey="earning"
                  name="Earnings (₹)"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                />
                <Bar
                  dataKey="deliveries"
                  name="Deliveries"
                  fill="#14b8a6"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>

            <p className="mt-4 text-lg font-bold text-teal-700">
              {earning || 0} Earned today
            </p>

            <button
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg"
              onClick={() => window.location.reload()}
            >
              Refresh Earning
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeOrder && userLocation) {
    return (
      <div className="p-4 pt-30 min-h-screen bg-gray-80">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-teal-700 mb-2">
            Active Delivery
          </h1>
          <p className="text-gray-600 text-sm mb-4">order # {activeOrder.id}</p>

          <div className="rounded-xl border shadow-lg overflow-hidden mb-6">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation || userLocation}
            />
          </div>
          {userData?.id ? (
            <DeliveryChat
              orderId={activeOrder.id}
              deliveryBoyId={userData.id}
              socketRef={socketRef}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="bg-gray-200 p-3 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium text-center">
                Order or Delivery Person details are missing.
              </p>
              <p className="text-gray-400 text-sm">
                Please check the order status and try again.
              </p>
            </div>
          )}

          <div className="mt-6 bg-white rounded-xl border shadow p-6">
            {!activeOrder.deliveryOtpVerification && !showOtpBox && (
              <button
                disabled={sendOtpLoading}
                className="w-full py-4 bg-teal-600 text-white rounded-lg"
                onClick={sendOtp}
              >
                {sendOtpLoading ? "sending..." : "Mark as deliver"}
              </button>
            )}

            {showOtpBox && (
              <div className="mt-4">
                <input
                  type="text"
                  className="w-full mb-2 py-3 border rounded-lg text-center"
                  placeholder="Enter your otp"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                  onClick={verifyOtp}
                >
                  {verifyOtpLoading ? "verifying..." : "Verify Otp"}
                </button>
              </div>
            )}

            {activeOrder.deliveryOtpVerification && (
              <div className="text-teal-700 text-center font-bold">
                Delivered Completed!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  console.log(deliveryAssignment)

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto mt-25">
        <h2 className="text-2xl font-bold mb-7.5">Delivery assignment</h2>
        {deliveryAssignment &&
          deliveryAssignment.map((da) => (
            <div key={da.id} className="p-5 bg-white rounded-xl shadow mb-4">
              <p>
                {" "}
                <b>Order Id </b>#{da?.order?.id ?? da?.orderId ?? "N/A"}
              </p>
              <p className="text-gray-600">
                {da.order.address.fullAddress}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  onClick={() => handleAccept(da.id)}
                >
                  Accept
                </button>
                <button className="flex-1 bg-red-600 text-white py-2 rounded-lg" onClick={()=>handleReject(da.id, userData?.id!)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
