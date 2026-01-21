import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
        const session = await auth();
        if(!session || !session.user?.id)
        {
            return NextResponse.json(
            {message: "delivery boy not found"},
            {status:500}
            )
        }
        const activeAssignment = await prisma.deliveryAssignment.findFirst({
            where: {
                assignedToId: session.user?.id,
                status: "ASSIGNED"
            },
            select: {
                id:true,
                order:true,
                createdAt:true,
                updatedAt:true
            }
        })

        return NextResponse.json(
            {activeAssignment: activeAssignment,
                message: "order found successfully"},
                {status:200}
        )
        
    } catch (error) {
      return NextResponse.json(
        {message: "order not found"},
        {status:500}
      )  
    }
}