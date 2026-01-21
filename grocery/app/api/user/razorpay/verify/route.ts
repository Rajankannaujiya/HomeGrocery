import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature", success: false },
        { status: 400 }
      );
    }

    const result = await prisma.order.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentId: razorpay_payment_id,
        status: OrderStatus.PROCESSING,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Order not found in database", success: false },
        { status: 404 }
      );
    }

    console.log(`✅ Payment Verified: ${result.count} order(s) updated.`);

    return NextResponse.json({ 
      message: "Payment verified successfully", 
      success: true 
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Verification Error:", error.message);
    return NextResponse.json(
      { message: "Verification failed", error: error.message },
      { status: 500 }
    );
  }
}