import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function proxy(req: NextRequest){

    const {pathname} = req.nextUrl;

    const publicRoutes = ["/login", "/register", "/api/auth"]

    if(publicRoutes.some((path)=>pathname.startsWith(path))){
        return NextResponse.next();
    }

    // const token  = await getToken({req, secret:process.env.AUTH_SECRET});
    const session  = await auth();
    if(!session){
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url)

        return NextResponse.redirect(loginUrl)
    }

    const role = session.user?.role;

    if(pathname.startsWith("/user") && role !== 'USER'){
        return NextResponse.redirect(new URL("/unauthorize", req.url))
    }

    if(pathname.startsWith("/admin") && role !== 'ADMIN'){
        return NextResponse.redirect(new URL("/unauthorize", req.url))
    }

    if(pathname.startsWith("/deliveryboy") && role !== 'DELIVERY_BOY'){
        return NextResponse.redirect(new URL("/unauthorize", req.url))
    }


}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};