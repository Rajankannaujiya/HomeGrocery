import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        let {orderId, deliveryBoyId, userId} = await req.json();
        
        const order = await prisma.order.findUnique({where:{
            id: orderId
        }})
        if(!userId){
            userId = order?.userId
        }

        let room = await prisma.chatRoom.findUnique({
            where:{
                orderId : orderId
            }
        })

        
        if(!order){
            return NextResponse.json(
            {room: room,
                message: 'order with this orderId not found'
            },
            {status:200}
        )
        }

        if(!room){
            room = await prisma.chatRoom.create({
                data:{
                    orderId,
                    userId: userId,
                    deliveryBoyId
                }
            })
        }

        return NextResponse.json(
            {room: room,
                message: 'successfully fetched chat room'
            },
            {status:200}
        )
    } catch (error) {
        console.log('error', error)
         return NextResponse.json(
            {message: `create room error ${error}`},
            {status:500}
        )
    }
}