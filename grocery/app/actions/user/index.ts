import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { Session } from "next-auth";


export const getUser = async (session: Session | null) => {
  if (!session?.user?.email) return null;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email 
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        mobile: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getAllUser = async()=>{
    const session = await auth();
    if(!session || !session.user){
        throw new Error("user or session not found");
    }

    try {
        const users = await prisma.user.findMany({
          where: {
            role: "USER"
          }
        });

        return users;
    } catch (error) {
        console.log(error);
    }
}