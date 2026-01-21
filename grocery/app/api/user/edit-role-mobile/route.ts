import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const {role, mobile} = await req.json();
        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json(
                {message: "session is not available"},
                {status:200}
            )
        }
        const user = await prisma.user.update({
            where:{
                email: session.user.email
            },
            data:{
                role: role,
                mobile: mobile
            }
        })

        return NextResponse.json(user,
            {status: 200}
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {mesage: `edit role and mobile error ${error}` },
            {status:200}
        )
    }
}