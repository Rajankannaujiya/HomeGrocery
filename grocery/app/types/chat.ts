export interface ChatRoomtype {
    orderId: string;
    deliveryBoyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

export interface MessageType{
     text: string;
    time: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    chatRoomId: string;
    senderId: string;
    isRead: boolean;
    chatRoom?: ChatRoomtype
}