import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        user: true,
        totalAmount: true,
        paymentId: true,
        paymentMethod: true,
        paymentStatus: true,
        razorpayOrderId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        items: true,
        address: true,
        deliveryAssignments: {
          select: {
            id: true,
            assignedTo: true,
            status: true,
            acceptedAt: true,
            createdAt: true,
            updatedAt: true,
          }
        },
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get orders error: ${error}` },
      { status: 500 }
    );
  }
}
