import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId, otp } = await req.json();
    console.log(orderId, otp);

    if (!orderId || !otp) {
      return NextResponse.json(
        { message: "Please send all the data" },
        { status: 400 },
      );
    }
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (order?.deliveryOtp !== otp) {
      return NextResponse.json(
        { message: "incorrect or expired otp" },
        { status: 400 },
      );
    }

    const [updatedOrder, assignment] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          deliveryOtpVerification: true,
          paymentStatus: "PAID"
        },
        select: {
          id: true,
          user: true,
        },
      }),
      prisma.deliveryAssignment.updateMany({
        where: {
          orderId: orderId,
          status: "ASSIGNED"
        },
        data: {
          status: "COMPLETED",
        },
      }),
    ]);

    await sendMail(
      updatedOrder.user.email,
      "Delivery Confirmed - Order #" + updatedOrder.id,
      `<h2>Your order has arrived!</h2>
     <p>Hi ${updatedOrder.user.name},</p>
     <p>Great news! Your order <strong>#${updatedOrder.id}</strong> has been successfully delivered to your address.</p>
     <p>We hope you enjoy your purchase. Thank you for shopping with us!</p>`,
    );

    return NextResponse.json(
      { message: "otp verify successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "unable to verify otp" },
      { status: 500 },
    );
  }
}
