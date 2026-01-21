import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
            const session = await auth();
            if(!session || !session.user || session.user.role !== "ADMIN"){
                return NextResponse.json(
                    {message: "user or session not found"},
                    {status:400}
                )
            }
        
                const groceries = await prisma.grocery.findMany({});
        
                return NextResponse.json(
                    {groceries:groceries},
                    {status:200}
                )
    
    } catch (error) {
                console.log(`get groceries error ${error}`);
                return NextResponse.json(
                    {message:"get groceries error"},
                    {status:500}
                )
            }
}