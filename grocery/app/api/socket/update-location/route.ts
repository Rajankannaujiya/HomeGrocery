import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        // location = [longitude, latitude]
        const {userId, location} = await req.json();
        if(!userId || !location){
            return NextResponse.json(
                {message: 'misssing userid'},
                {status:400}
            )
        }

        const user = await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                location
            }
        })

        return NextResponse.json(  
            {user,
                message: "location update"},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
                {message: `something went wrong in api update-location ${error}`},
                {status:500}
            )
    }
}