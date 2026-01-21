
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, groceryId, quantity = 1, action } = await req.json();

    console.log(userId, groceryId, quantity, action)
    if (!userId || !groceryId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {}, 
      create: { userId },
    });

    if (action === "DELETE" || quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          cartId_groceryId: { cartId: cart.id, groceryId }
        }
      });
      return NextResponse.json({ message: "Item removed" }, { status: 200 });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
          cartId_groceryId: {
          cartId: cart.id,
          groceryId: groceryId,
        },
      },
      update: {
        quantity: action === "SET" ? quantity : { increment: 1 },
      },
      create: {
        cartId: cart.id,
        groceryId: groceryId,
        quantity: quantity,
      },
      include: {
        grocery: true,
      }
    });

    return NextResponse.json(cartItem, { status: 200 });
  } catch (error: any) {
    console.error("CART_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  }
}