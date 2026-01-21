import { getUser } from "@/app/actions/user";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json(
                {message: "user is not authenticated"},
                {status:400}
            )
        }

        const user = await getUser(session);
        return NextResponse.json(
            user,
            {status:200}
        );
    } catch (error) {
        console.log(`error in me ${error}`);
        return NextResponse.json(
                {message: `get me error ${error}`},
                {status:500}
            )
    }
}