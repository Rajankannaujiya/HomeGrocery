import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        user: true,
        address: true,
        items: true,
        deliveryAssignments: {
          select: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                location:true
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    console.log(order);

    return NextResponse.json(
      { message: "order found successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.log(`enable to get the order ${error}`);
    return NextResponse.json({ message: "order not found" }, { status: 500 });
  }
}
