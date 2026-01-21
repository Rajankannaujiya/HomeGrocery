import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  const deliveryBoyId = session?.user?.id;

  if (!deliveryBoyId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Check if the delivery boy is already busy
      const busy = await tx.deliveryAssignment.findFirst({
        where: {
          assignedToId: deliveryBoyId,
          status: { notIn: ["BRODCASTED", "COMPLETED"] },
        },
      });

      if (busy) throw new Error("You already have an active delivery");

      const updatedAssignment = await tx.deliveryAssignment.updateMany({
        where: { id: id, status: "BRODCASTED" },
        data: {
          assignedToId: deliveryBoyId,
          status: "ASSIGNED",
        },
      });

      if (updatedAssignment.count === 0) {
        throw new Error("Order no longer available");
      }

      await tx.$runCommandRaw({
        update: "delivery_assignments",
        updates: [
          {
            q: {
              _id: { $ne: { $oid: id } },
              brodcastedToIds: { $oid: deliveryBoyId },
              status: "BRODCASTED",
            },
            u: {
              $pull: { brodcastedToIds: { $oid: deliveryBoyId } },
            },
            multi: true,
          },
        ],
      });
    });

    return NextResponse.json(
      { message: "Order accepted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
