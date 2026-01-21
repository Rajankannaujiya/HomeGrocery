import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; 

    if (!userId) {
      return NextResponse.json({ message: "User ID missing" }, { status: 400 });
    }
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: {
            grocery: true,
          },
        },
      },
    });

    return NextResponse.json(cart?.items || [], { status: 200 });
  } catch (error) {
    console.error("GET_CART_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}