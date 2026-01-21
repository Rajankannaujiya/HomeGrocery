import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    const otp = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        deliveryOtp: otp,
        deliveryOtpVerification: false,
      },
      select: {
        id: true,
        user: true,
      },
    });

    await sendMail(
      updatedOrder.user.email,
      "Your order is almost there! 📦",
      `<h2>Ready for your delivery?</h2>
     <p>Your courier is nearby! To complete the delivery, please provide them with this 4-digit code:</p>
     <p style="font-size: 28px; font-weight: bold; border-left: 4px solid #007bff; padding-left: 10px;">
        ${otp}
     </p>
     <p>Thanks for choosing us!</p>`,
    );

    return NextResponse.json(
      { message: "otp sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "unable to send otp" },
      { status: 500 },
    );
  }
}
