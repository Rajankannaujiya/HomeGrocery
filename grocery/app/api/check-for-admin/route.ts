import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: process.env.ADMIN_EMAIL,
                role: 'ADMIN',
            }
        });

        if (user) {
            return NextResponse.json({ adminExists: true, user: user, message: "Admin found" });
        } else {
            return NextResponse.json({ adminExists: false, message: "No admin found" });
        }
        
    } catch (error) {
        return NextResponse.json({ adminExists: false, error: "Server error" }, { status: 500 });
    }
}