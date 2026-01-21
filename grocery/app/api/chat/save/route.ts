import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        const {senderId, chatRoomId, text, time} = await req.json();
       const message =  await prisma.$transaction(async(tx)=>{
            await prisma.chatRoom.findUnique({
                where: {
                    id: chatRoomId
                }
            })

            const message = await prisma.message.create({
                data:{
                    senderId,
                    time,
                    text,
                    chatRoomId: chatRoomId
                }
            })
            return message
        })

        return NextResponse.json(
            {message: message,
            },
            {status:200}
        )

    } catch (error) {
        console.log(`errror while saving`,error)
         return NextResponse.json(
                    {message: `save message room error ${error}`},
                    {status:500}
                )
    }
}