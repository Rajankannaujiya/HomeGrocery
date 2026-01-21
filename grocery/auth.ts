import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
        credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
            const email = credentials.email;
            const password = credentials.password;

            if (typeof email !== "string" || typeof password !== "string") {
                return null;
            }
            const user = await prisma.user.findFirst({
                where:{
                    email: email
                }
            });

            if(!user){
                throw new Error("user does not exist");
            }

            if(!user.password){
                throw new Error("user must have OAuth Signup")
            }
            const isPasswordMatched = await bcrypt.compare(password, user.password);

            if(!isPasswordMatched){
                throw new Error("Incorrect Password");
            }

            return {
                id: user.id.toString(),
                email:user.email,
                name: user.name,
                role: user.role
            }
        },
    }),
    Google({
        clientId: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],

  secret: process.env.AUTH_SECRET,
  callbacks: {

async signIn({ user, account }) {
  if (account?.provider === "google" && user.email) {
    try {
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      const assignedRole = user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            name: user.name ?? "Unknown User",
            email: user.email,
            image: user.image ?? "",
            role: assignedRole, 
          }
        });
      } else if (dbUser.role !== assignedRole && user.email === process.env.ADMIN_EMAIL) {
        dbUser = await prisma.user.update({
          where: { email: user.email },
          data: { role: "ADMIN" }
        });
      }

      user.id = dbUser.id.toString();
      user.role = dbUser.role; 

      return true;
    } catch (error) {
      console.error("Error during sign in:", error);
      return false; 
    }
  }
  return true; 
},

    jwt({token, user, trigger, session}){
        if(user){
            token.id = user.id,
            token.name = user.name,
            token.email = user.email,
            token.role = user.role
        }
        if(trigger === 'update'){
          token.role = session.role
        }

        return token;
    },

    session({session, token}){
        if(session.user){
            session.user.id = token.id as string
            session.user.name = token.name as string
            session.user.email = token.email as string
            session.user.role = token.role as string
        }
        return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 10*24*60*60*1000
  },
})