import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { daId, deliveryBoyId } = await req.json();

        await prisma.$transaction(async (tx) => {


            const assignment = await tx.deliveryAssignment.findMany({
                where: { id: daId },
                select:{
                    brodcastedToIds: true
                }
            });

            if (assignment && assignment[0].brodcastedToIds) {
               const updatedBroadcastIds = assignment[0].brodcastedToIds.filter(
                    (id) => id !== deliveryBoyId
                );

               const updatedAssignment =  await tx.deliveryAssignment.update({
                    where: { id: daId },
                    data: {
                        brodcastedToIds: {
                            set: updatedBroadcastIds
                        },
                    }
                });

                if (updatedAssignment.brodcastedToIds.length === 0) {
                await tx.order.update({
                    where: {
                        id: updatedAssignment.orderId,
                        status: "OUT_OF_DELIVERY"
                    },
                    data: { status: "PROCESSING" }
                });

                await tx.deliveryAssignment.delete({
                    where: {
                        id: daId
                    }
                })
            }
            }
        });


        return NextResponse.json({ message: "Rejected and removed from broadcast" }, {status:200});

    } catch (error) {
        console.error(`Error: ${error}`);
        return NextResponse.json({ message: "Failed to reject" }, { status: 500 });
    }
}