import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      
      // Protect admin routes
      if (isAdminRoute) {
        if (isLoggedIn) {
          // Check if user is an admin by email
          const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
          if (adminEmails.includes(auth.user?.email || "")) return true;
          return Response.redirect(new URL("/", nextUrl));
        }
        return false; // Redirect to login
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  events: {
    async signIn({ user }) {
      if (!user.email) return;
      
      const client = await clientPromise;
      const db = client.db();
      
      // Update user with tracking info
      await db.collection("users").updateOne(
        { email: user.email },
        { 
          $set: { 
            lastAppUsed: process.env.APP_NAME || "Primadex",
            lastLoginAt: new Date()
          },
          $addToSet: { 
            authorizedApps: process.env.APP_NAME || "Primadex" 
          }
        }
      );
    }
  }
});
