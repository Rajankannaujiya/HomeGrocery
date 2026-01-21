import { prisma } from "@/lib/db";
import { emitEventHandler } from "@/lib/emitEventHandler";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, items, paymentMethod, totalAmount, address } =
      await req.json();


    if (
      !userId ||
      !items ||
      !paymentMethod ||
      paymentMethod !== "COD" ||
      !totalAmount ||
      !address
    ) {
      return NextResponse.json(
        { message: "Please send all credentials" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const newOrder = await prisma.order.create({
      data: {
        userId,
        items,
        paymentMethod,
        totalAmount,
        address,
        paymentStatus: PaymentStatus.UNPAID,
        status: OrderStatus.PENDING,
      },
    });

    await emitEventHandler("new-order", newOrder)
    return NextResponse.json(newOrder, { status: 200 });
  } catch (error) {
    console.log(`error in order ${error}`);
    return NextResponse.json(
      { message: `Place order error ${error}` },
      { status: 500 }
    );
  }
}
