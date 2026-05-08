import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb-client";

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
const hasMongo = !!process.env.MONGODB_URI;
const authSecret = process.env.AUTH_SECRET || "build-time-fallback-secret";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret,
  adapter: (hasMongo && !isBuildTime) ? MongoDBAdapter(clientPromise) : undefined,
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
      
      try {
        const client = await clientPromise;
        const db = client.db();
        
        console.log(`[Auth] Sign-in event for: ${user.email}`);
        
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
      } catch (error) {
        console.error("[Auth] Database error in signIn event:", error);
      }
    }
  }
});
