import { auth } from "@/auth";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { Category, Unit } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if(session?.user?.role !== "ADMIN"){
            return NextResponse.json(
                {message: "you are not admin"},
                {status: 400}
            )
        }

        const formData = await req.formData();
        
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const category = formData.get("category") as Category;
        const unit = formData.get("unit") as Unit;
        const price = formData.get("price") as string;
        const file  = formData.get("image") as Blob

        let imageUrl;
        if(file){
            imageUrl = await uploadOnCloudinary(file)
        }

        if(!imageUrl){
            return NextResponse.json(
                {message: "Unable to upload the image"},
                {status:400}
            )
        }
        const grocery = await prisma.grocery.update({
            where:{
                id: id
            },
            data:{
                name,
                category,
                unit,
                price,
                image: imageUrl
            }
        })

        return NextResponse.json(
            {grocery},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
                {message: `Grocery add error ${error}`},
                {status:500}
            )   
    }
}