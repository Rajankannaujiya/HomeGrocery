import { Unit } from "./grocery";
import { UserType } from "./user";


export type PaymentMethod = "COD" | "ONLINE";
export type OrderStatus = "PENDING" | "PROCESSING" | "OUT_OF_DELIVERY" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED"

export type DeliveryAssignStatus = "BROADCAST" | "ASSIGNMENT" | "COMPLETED"

export interface OrderAddress {
        fullName: string;
        mobile: string;
        city: string;
        state: string;
        pincode: string;
        fullAddress: string;
        latitude: number;
        longitude: number;
}

export interface OrderItem {
        groceryId: string;
        name: string;
        price: string;
        unit: Unit;   
        image: string | null;
        quantity: number;
}

export interface OrderType {
    id: string;
    user: UserType;
    items: OrderItem[];
    address: OrderAddress;
    totalAmount: string;
    paymentStatus:   PaymentStatus;
    status: OrderStatus
    paymentMethod: PaymentMethod;
    razorpayOrderId?: string;
    paymentId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deliveryAssignments?: DeliveryAssignType[]
}

export interface DeliveryAssignType{
        id:string;
        order?: OrderType;
        brodcastedTo?: UserType[];
        assignedTo?: UserType | null;
        status?: DeliveryAssignStatus;
        acceptedAt: Date;
        createdAt?: Date;
        updatedAt?: Date;
}
