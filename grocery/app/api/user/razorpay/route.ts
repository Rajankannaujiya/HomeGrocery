import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PaymentStatus, OrderStatus } from "@prisma/client";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!, //
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, totalAmount, address, paymentMethod } = body;

    const options = {
      amount: Math.round(Number(totalAmount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const dbOrder = await prisma.order.create({
      data: {
        userId: userId,
        items: items, 
        address: address,
        totalAmount: String(totalAmount),
        paymentMethod: paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        razorpayOrderId: razorpayOrder.id, // We store this to find it later in 'verify'
      },
    });

    return NextResponse.json({ 
      orderId: razorpayOrder.id, 
      amount: razorpayOrder.amount,
      dbOrderId: dbOrder.id 
    },{status:200});

  } catch (error: any) {
    console.error("RAZORPAY_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" }, 
      { status: 500 }
    );
  }
}