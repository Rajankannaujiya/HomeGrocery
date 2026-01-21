import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const {name, email, password} = await req.json();
        const existingUser = await prisma.user.findFirst({
            where:{
                email
            }
        })

        if(existingUser){
            return NextResponse.json(
                {message: "email already exists"},
                {status: 400}
            );
        }

        if(password.length < 6){
            return NextResponse.json(
                {message: "password must be atleast 6 digit"},
                {status: 400}
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        })

        return NextResponse.json(
            {message: user},
            {status:200}
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {message:`register error ${error}`},
            {status:500}
        )
    }
}