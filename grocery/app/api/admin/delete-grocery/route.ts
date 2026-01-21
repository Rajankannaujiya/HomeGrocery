import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

    if (!session || !session.user || session.user.role !== "ADMIN" || !id) {
      return NextResponse.json(
        { message: "user, session or id not found" },
        { status: 400 },
      );
    }

    const groceries = await prisma.grocery.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ groceries: groceries }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Unable to Delete Grocery" },
      { status: 500 },
    );
  }
}
