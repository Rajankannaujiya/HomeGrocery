import axios from "axios";

export const connection = new Map();

export const room = new Map();

export async function handlePayload(ws, payload) {
  switch (payload.type) {
    case "identity":
      handleConnection(ws, payload);
      break;

    case "update-location":
      handleUpdateLocation(ws, payload);
      break;

    case "update-deliveryBoy-location":
      handleRealTimeDeliveryUpdate(payload);
      break;

    case "join-room":
      handleJoinRoom(ws, payload);
      break;

    case "new-message":
      handleNewMessage(ws, payload);
      break;

    default:
      console.log(`unable to identify type`, payload.type);
  }
}

async function handleConnection(ws, payload) {
  const { userId } = payload;
  console.log("Connecting User:", userId);
  
  try {
    if (userId) {
      if (connection.has(userId)) {
        console.log(`User ${userId} reconnected. Replacing old socket.`);
      }
      ws.userId = userId;
      // returns an active socket id
      connection.set(userId, ws);
      console.log(`Connection established and mapped for: ${userId}`);
    }
  } catch (error) {
    console.error("Error in handleConnection:", error);
  }
}

async function handleUpdateLocation(ws, payload) {
  try {
    const { userId, latitude, longitude } = payload;
    if (!connection.get(userId)) {
      connection.set(userId, ws);
    }

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    await axios.post(
      `${process.env.NEXT_BASE_URL}/api/socket/update-location`,
      {
        userId,
        location,
      },
    );
  } catch (error) {
    console.log("error in location update", error);
  }
}

async function handleRealTimeDeliveryUpdate(payload) {
  console.log("in the handleRealtimeDelivery");
  try {
    const { type, userId, location, userIdOrder } = payload;
    console.log("the payload", payload);
    const delBoyLocMsg = {
      type: "update-deliveryBoy-location",
      userId: userId,
      location: location,
      userIdOrder: userIdOrder,
    };
    const ws = connection.get(userIdOrder);
    if (ws) {
      console.log("data sending", delBoyLocMsg);
      ws.send(JSON.stringify(delBoyLocMsg));
      console.log("data sent", delBoyLocMsg);
    }
  } catch (error) {
    console.log(error.message);
    console.log(`error in handleRealtimeDeliveryUpdate`);
  }
}

export async function handleJoinRoom(ws, payload) {
  const { roomId, senderId } = payload;

  if (!room.has(roomId)) {
    room.set(roomId, []);
  }

  const participants = room.get(roomId);

  const existingUserIndex = participants.findIndex(
    (p) => p.userId === senderId,
  );
  if (existingUserIndex !== -1) {
    participants[existingUserIndex].ws = ws;
  } else if (participants.length < 2) {
    participants.push({ userId: senderId, ws: ws });
  } else {
    ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
    return;
  }

  ws.roomId = roomId;
  ws.userId = senderId;

  console.log(
    `User ${senderId} joined room ${roomId}. Total: ${participants.length}`,
  );

  if (participants.length === 2) {
    const readyMsg = JSON.stringify({ type: "room-ready", roomId });
    participants.forEach((p) => p.ws.send(readyMsg));
  }
}

export async function handleNewMessage(ws, payload) {
  console.log("+===============+");
  const { roomId, senderId, text, time, chatRoomId } = payload.message;
  const participants = room.get(roomId);

  console.log(roomId, senderId, time, text);

  if (!participants) {
    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
    return;
  }

  try {
    await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, {
      senderId,
      chatRoomId,
      text,
      time,
    });
    const messageToBroadcast = {
      type: "new-message",
      message: {
        senderId,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    };
    participants.forEach((participant) => {
      if (participant.ws && participant.ws.readyState === 1) {
        // 1 is WebSocket.OPEN
        participant.ws.send(JSON.stringify(messageToBroadcast));
      }
    });
  } catch (error) {
    console.error("Message handling error:", error);
  }
}
export async function emitHandler(req, res) {
  const { event, data, userId } = req.body;

  if (!event) return res.status(400).send("Event name required");

  const message = JSON.stringify({ event, data });

  if (userId) {
    const ws = connection.get(userId);
    if (ws && ws.readyState === 1) {
      ws.send(message);
    }
  }

  if (data?.availableBoyIds && Array.isArray(data.availableBoyIds)) {
    data.availableBoyIds.forEach((boyId) => {
      const ws = connection.get(boyId);
      if (!ws) {
        console.log(`Broadcast failed: Delivery Boy ${boyId} is not in the Connection Map.`);
      } else if (ws.readyState !== 1) {
        console.log(`Broadcast failed: Delivery Boy ${boyId} socket state is ${ws.readyState}.`);
      } else {
        ws.send(message);
      }
    });
} else {
    connection.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(message);
      }
    });
  }

  res.status(200).json({ success: true });
}

export const notifyUser = async (req, res) => {
  const { type, data, userId } = req.body;

  if (!type) return res.status(400).send("Event name required");

  const messagePayload = {
    type: type,
    data: data,
  };
  const message = JSON.stringify(messagePayload);

  if (userId) {
    const ws = connection.get(userId);
    if (ws && ws.readyState === 1) {
      ws.send(message);
    } else {
      return res.status(404).send("User not connected");
    }
  } else {
    connection.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(message);
      }
    });
  }

  res.status(200).json({ success: true });
};
