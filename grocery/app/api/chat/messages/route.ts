import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
  
  const roomId = searchParams.get("roomId");
        if (!roomId) {
            return NextResponse.json({ message: "Room ID is required" }, { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: {
                chatRoomId: roomId
            },
            orderBy: {
                createdAt: 'asc'
            },
        });

        return NextResponse.json(
            { messages: messages },
            { status: 200 }
        );

    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}