import { auth } from "@/auth"
import { prisma } from "@/lib/db";


export const getAllGroceries = async()=>{
    const session = await auth();
    if(!session || !session.user){
        throw new Error("user or session not found");
    }

    try {
        const groceries = await prisma.grocery.findMany({});

        return groceries;
    } catch (error) {
        console.log(error);
    }
}