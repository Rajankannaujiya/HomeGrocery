import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const session = await auth();
        const deliveryassignment = await prisma.deliveryAssignment.findMany({
            where:{
                brodcastedToIds: {
                    has: session?.user?.id
                },
                status: "BRODCASTED"
            },
            select:{
                id: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                order: true,
                brodcastedTo: true,
                assignedTo: true,
                acceptedAt: true,
            }
        })

        return NextResponse.json(
            {deliveryassignment},
            {status:200}
        )

    } catch (error) {
        return NextResponse.json(
            {message: `get deliveryassignment error ${error}`},
            {status:500}
        )
    }
}