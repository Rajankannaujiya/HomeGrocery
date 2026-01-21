"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { OrderType } from "@/app/types/order";
import { LocationType } from "@/app/types/user";
import { getSocket } from "@/lib/websocket";
import { ArrowLeft, Loader2, Send, Sparkle } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "motion/react";
import { ChatRoomtype, MessageType } from "@/app/types/chat";

const LiveMap = dynamic(() => import("@/app/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-125 bg-slate-100 animate-pulse flex items-center justify-center rounded-xl">
      <p className="text-slate-400 font-medium">Loading Live Map...</p>
    </div>
  ),
});

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [room, setRoom] = useState<ChatRoomtype | null>(null);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<LocationType | null>(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const orderRef = useRef<OrderType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { userData } = useAppSelector((state) => state.user);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const response = await fetch(`/api/user/get-order/${orderId}`);
        const data = await response.json();

        if (response.ok && data.order) {
          setOrder(data.order);
          orderRef.current = data.order;

          setUserLocation({ 
            latitude: data.order.address.latitude, 
            longitude: data.order.address.longitude 
          });

          const assignment = data.order.deliveryAssignments?.[0];
          const dbCoords = assignment?.assignedTo?.location?.coordinates;
          if (dbCoords?.length >= 2) {
            setDeliveryBoyLocation({ latitude: dbCoords[1], longitude: dbCoords[0] });
          }
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    if (orderId) getOrder();
  }, [orderId]);

 useEffect(() => {
  const socket = getSocket(dispatch, userData);
  if (!socket) return;
  
  socketRef.current = socket;

  const handleOpen = () => {
    console.log("WebSocket Connected ✅");
    if (orderId && userData?.id) {
      socket.send(JSON.stringify({
        type: "join-room",
        roomId: orderId,
        senderId: userData.id,
      }));
    }
  };

  const handleClose = () => {
    console.log("WebSocket Disconnected ❌");
  };

  const handleMessage = (e: MessageEvent) => {
    try {
      if (typeof e.data === "string" && !e.data.startsWith("{")) return;
      const payload = JSON.parse(e.data);

      if (payload.type === "update-deliveryBoy-location") {
        const assignedId = orderRef.current?.deliveryAssignments?.[0]?.assignedTo?.id;
        if (String(payload.userId) === String(assignedId)) {

          setDeliveryBoyLocation({
            latitude: payload.location[0],
            longitude: payload.location[1],
          });
        }
      }

      if (payload.type === "new-message") {
        setMessages((prev) => [...prev, payload.message]);
      }
    } catch (error) {
      console.error("Socket Parsing Error:", error);
    }
  };

  socket.addEventListener("open", handleOpen);
  socket.addEventListener("close", handleClose);
  socket.addEventListener("message", handleMessage);

  return () => {
    socket.removeEventListener("open", handleOpen);
    socket.removeEventListener("close", handleClose);
    socket.removeEventListener("message", handleMessage);
  };
}, [userData, dispatch, orderId]);

  useEffect(() => {
    if (!order || !userData || !socketRef.current) return;

    const deliveryBoyId = order?.deliveryAssignments?.[0]?.assignedTo?.id;
    if (!deliveryBoyId) return;

    const initializeChat = async () => {
      try {
        const response = await fetch("/api/chat/chat-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            deliveryBoyId,
            userId: userData.id,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setRoom(data.room);
          socketRef.current?.send(JSON.stringify({
            type: "join-room",
            roomId: orderId,
            senderId: userData.id,
          }));
        }
      } catch (error) {
        console.error("Chat initialization error:", error);
      }
    };

    initializeChat();
  }, [order, userData]);


    useEffect(() => {
      if (!room?.id) return;
  
      const getAllMessages = async () => {
        try {
          const response = await fetch(`/api/chat/messages?roomId=${room?.id}`, {
            method: "GET",
          });
          const data = await response.json();
          if (!response.ok) {
            toast.error(data.message || "Error fetching messages");
            return;
          }
          setMessages(data.messages || []);
        } catch (error) {
          console.error("Fetch error:", error);
          toast.error("Unable to fetch messages");
        }
      };
      getAllMessages();
    }, [room?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Connecting to server...");
      return;
    }
    if (!room || !newMessage.trim()) return;

    const messagePayload = {
      type: "new-message",
      message: {
        chatRoomId: room.id,
        roomId: orderId,
        text: newMessage,
        senderId: userData?.id,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    };

    socketRef.current.send(JSON.stringify(messagePayload));
    setNewMessage("");
  };

  const getSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const lastMessage = messages
        ?.filter((m) => m.senderId !== userData?.id)
        ?.at(-1);
      if (!lastMessage) {
        toast.error("No message found to reply to");
        setLoadingSuggestions(false);
        return;
      }
      const response = await fetch("/api/chat/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: lastMessage.text,
          role: "delivery_boy",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch suggestions");
      }

      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("AI Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to get suggestions",
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b shadow-sm flex items-center gap-4 z-50">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="text-slate-700" size={24} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Track Your Order</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">#{String(orderId).slice(-6)}</span>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-bold uppercase">
                {order?.status || "Processing"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="px-4 mt-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white h-125 relative">
            {userLocation && deliveryBoyLocation ? (
              <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Waiting for driver's location...</p>
              </div>
            )}
          </div>
        </div>

        {/* Address & Chat Section */}
        <div className="px-4 mt-6 space-y-6">
          {/* Address Card */}
          {order && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Delivery Address</h3>
              <p className="text-slate-800 font-medium">{order.address.fullName} • {order.address.mobile}</p>
              <p className="text-slate-600 text-sm mt-1">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            </div>
          )}


          <div className="bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col">

          <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700 text-sm">
          Quick Replies
        </span>
        <motion.button
          disabled={loadingSuggestions}
          onClick={getSuggestions}
          className="px-3 py-1 textxs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer"
        >
          {loadingSuggestions ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Sparkle size={14} />
          )}
          {loadingSuggestions ? "Thinking..." : "AI Suggestion"}
        </motion.button>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            className="px-3 py-1 text-xs bg-green-50 border border-teal-200 text-teal-700 rounded-full cursor-pointer"
            onClick={() => setNewMessage(s)}
          >
            {s}
          </motion.div>
        ))}
      </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId === userData?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`px-4 py-2 max-w-[80%] rounded-2xl shadow-sm ${
                      msg.senderId === userData?.id 
                        ? "bg-teal-600 text-white rounded-br-none" 
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.senderId === userData?.id ? "text-teal-100" : "text-gray-400"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={scrollRef} />
              </AnimatePresence>
            </div>

            <div className="flex gap-2 mt-3 border-t pt-3">
              <input
                type="text"
                placeholder="Message delivery partner..."
                className="flex-1 bg-gray-50 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 border"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="bg-teal-600 hover:bg-teal-700 p-3 rounded-xl text-white transition-colors"
                onClick={sendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;