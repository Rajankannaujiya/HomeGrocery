import { prisma } from "@/lib/db";
import { emitEventHandler } from "@/lib/emitEventHandler";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }>},
) {
  try {
    const { orderId } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        deliveryAssignments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (status === "OUT_OF_DELIVERY") {
      console.log(order.deliveryAssignments);
      if (order.deliveryAssignments.length === 0) {
        const { latitude, longitude } = order.address as any;

        const rawResults = (await prisma.user.aggregateRaw({
          pipeline: [
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                distanceField: "distanceInMeters",
                query: { role: "DELIVERY_BOY" },
                spherical: true,
              },
            },
          ],
        })) as unknown as any[];

        const nearByIds = rawResults.map(
          (boy) => boy._id.$oid || boy._id.toString(),
        );
        const busyAssignments = await prisma.deliveryAssignment.findMany({
          where: {
            assignedToId: { in: nearByIds },
            status: "ASSIGNED",
          },
        });

        const busyBoyIds = busyAssignments.map((a) => a.assignedToId);
        const availableBoyIds = nearByIds.filter(
          (id) => !busyBoyIds.includes(id),
        );

        if (availableBoyIds.length === 0) {
          return NextResponse.json(
            { message: "No available delivery boys found nearby." },
            { status: 400 }, // Use 400 because the action couldn't be completed
          );
        }

        const deliveryBoysPayload = rawResults
          .filter((b) =>
            availableBoyIds.includes(b._id.$oid || b._id.toString()),
          )
          .map((b) => ({
            id: b._id.$oid || b._id.toString(),
            name: b.name,
            mobile: b.mobile,
            latitude: b.location.coordinates[1],
            longitude: b.location.coordinates[0],
          }));

        // ATOMIC TRANSACTION: Create Broadcast and Update Order Status
        const [deliveryAssignment, updatedOrder] = await prisma.$transaction([
          prisma.deliveryAssignment.create({
            data: {
              orderId: order.id,
              brodcastedToIds: availableBoyIds,
              status: "BRODCASTED",
            },
            select:{
                id: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                order: true,
                brodcastedTo: true,
                assignedTo: true,
                acceptedAt: true,
            }
          }),
          prisma.order.update({
            where: { id: order.id },
            data: { status: "OUT_OF_DELIVERY" },
          }),
        ]);

        await emitEventHandler("order-status-update", {
          orderId: order.id,
          deliveryAssignment,
          availableBoyIds,
          status: "OUT_OF_DELIVERY",
        });

        return NextResponse.json({
          updatedOrder,
          availableBoys: deliveryBoysPayload,
          message: "Order broadcasted to nearby delivery boys.",
        });
      }

      // B. Assignment already exists, just update the status
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "OUT_OF_DELIVERY" },
      });

      return NextResponse.json({
        updatedOrder,
        message: "Status updated to Out of Delivery",
      });
    }
    if (
      order.status === "OUT_OF_DELIVERY" &&
      status !== "DELIVERED" &&
      status !== "CANCELLED"
    ) {
      return NextResponse.json(
        {
          message: "Order is already out for delivery and cannot be reverted.",
        },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });

    const deliveryAssignment = await prisma.deliveryAssignment.findMany({
      where: { orderId: updatedOrder.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        order: true,
        brodcastedTo: true,
        assignedTo: true,
        acceptedAt: true,
      },
    });

    await emitEventHandler("order-status-update", {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      deliveryAssignment: deliveryAssignment,
    });

    return NextResponse.json({
      updatedOrder,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error(`Update Error:`, error);
    return NextResponse.json(
      {
        message: `Server Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
