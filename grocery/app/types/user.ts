
export type Role = "USER" | "ADMIN" | "DELIVERY_BOY";

export interface UserType {
    id?: string;
    name: string;
    email: string;
    password?: string; 
    mobile: string | null; 
    role: Role;
    image: string | null; 
    createdAt: Date;
    updatedAt: Date;
}

export interface LocationType {
  latitude: number;
  longitude: number;
}