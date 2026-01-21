import { Loader2, Send, Sparkle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { ChatRoomtype, MessageType } from "../types/chat";
import { motion, AnimatePresence } from "motion/react"; // Note: ensure motion/react or framer-motion matches your install
import { toast } from "react-toastify";

type Props = {
  orderId: string;
  deliveryBoyId: string;
  socketRef: React.RefObject<WebSocket | null>;
};

function DeliveryChat({ orderId, deliveryBoyId, socketRef }: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [room, setRoom] = useState<ChatRoomtype | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 1. Initialize Room
  useEffect(() => {
    let isMounted = true;
    const initializeChat = async () => {
      if (!deliveryBoyId) return;
      try {
        const response = await fetch("/api/chat/chat-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, deliveryBoyId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error("Failed to initialize room");

        if (isMounted) {
          setRoom(data.room);

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: "join-room",
                roomId: orderId,
                senderId: deliveryBoyId,
              }),
            );
          }
        }
      } catch (error) {
        console.error("Chat initialization error:", error);
      }
    };

    initializeChat();
  }, [orderId, deliveryBoyId]);

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

  // 3. Socket Listener
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new-message") {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (error) {
        console.error("Socket parsing error:", error);
      }
    };

    socket.addEventListener("message", handleNewMessage);
    return () => socket.removeEventListener("message", handleNewMessage);
  }, [socketRef]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!socketRef.current || !room || !newMessage.trim()) return;

    const message = {
      chatRoomId: room.id,
      roomId: orderId,
      text: newMessage,
      senderId: deliveryBoyId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socketRef.current.send(JSON.stringify({ type: "new-message", message }));
    setNewMessage("");
  };

  const getSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const lastMessage = messages
        ?.filter((m) => m.senderId !== deliveryBoyId)
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
              key={msg.id || `msg-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${msg.senderId === deliveryBoyId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 max-w-[75%] rounded-2xl shadow-sm ${
                  msg.senderId === deliveryBoyId
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${msg.senderId === deliveryBoyId ? "text-teal-100" : "text-gray-400"}`}
                >
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
          placeholder="Type a Message..."
          className="flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
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
  );
}

export default DeliveryChat;
