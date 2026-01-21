import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    try {
        const session = await auth();
        if(!session){
            return NextResponse.json(
                {message: "user is not logged in"},
                {status: 200}
            )
        }
        const orders = await prisma.order.findMany({
           where: {
            userId: session?.user?.id
           },
           select:{
            id:true,
            user:{
                select:{
                    id: true,
                    email:true,
                    name:true,
                    mobile:true,
                    image:true,
                    role:true,
                    createdAt:true,
                    updatedAt:true
                }
            },
            items:true,
            address:true,
            totalAmount: true,
            paymentMethod: true,
            status:true,
            paymentStatus:true,
            razorpayOrderId: true,
            paymentId:true,
            createdAt:true,
            updatedAt:true,
            deliveryAssignments: {
                select:{
                    id: true,
                    assignedTo: true,
                    status: true,
                    acceptedAt: true,
                    createdAt: true,
                    updatedAt: true,

                }
            }
           },
            skip: 0, 
            take: 10, 
            orderBy: {
                createdAt: 'desc' 
            }
        })

        return NextResponse.json(
            orders,
            {status:200}
        )
    } catch (error) {
        console.log(`error in my-order ${error}`);
        return NextResponse.json(
                {message: `get all orders error: ${error}`},
                {status: 500}
        )
    }
}