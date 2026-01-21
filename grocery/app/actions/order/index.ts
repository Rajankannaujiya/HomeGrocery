import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const getAllOrders = async()=>{
    const session = await auth();
    if(!session || !session.user){
        throw new Error("user or session not found");
    }

    try {
        const orders = await prisma.order.findMany({});

        return orders;
    } catch (error) {
        console.log(error);
    }
}

export const deliveredOrders = async()=>{
    try {
        const session = await auth();
        if(!session || !session.user){
            throw new Error("user or session not found");
        }
        
        const orders = await prisma.order.findMany({
            where: {
                deliveryOtpVerification: true,
                deliveryAssignments:{
                    some: {
                        status: "COMPLETED",
                        assignedToId: { not: null}
                    }
                }
            },
            include: {
                deliveryAssignments: {
                    where: {status: "COMPLETED"},
                    include: {
                        assignedTo:true
                    }
                }
            }
        });

        return orders;
    } catch (error) {
        console.log(`unable to get all delivered ordere by the delivery boy ${error}`)
    }
}