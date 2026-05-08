# 🛡️ Shared Auth Implementation Guide (Primadex Ecosystem)

Yeh guide aapko batayegi ki kaise kisi bhi naye project ko **Primadex Centralized Auth** se link karna hai. Isse aapke saare apps ek hi User Database use karenge.

---

## 1. Environment Variables (.env.local)
Naye project ki `.env.local` mein yeh values copy karein.
> **Note**: `AUTH_DATABASE_URL` hamesha wahi rahega jo Primadex ka hai. `APP_DATABASE_URL` aapke naye app ka apna alag database hoga.

```env
# 1. Centralized Auth DB (Common for all apps)
# Yahan Primadex wala connection string aayega
AUTH_DATABASE_URL="mongodb+srv://devanandutkarsh7_db_user:xj3RkWRS1CFxHYdi@cluster0.jsd3mdq.mongodb.net/primadex?retryWrites=true&w=majority"
AUTH_SECRET="devanand" # Same as Primadex
APP_NAME="YOUR_APP_NAME" # Example: "TeachBoard" or "FinanceApp"

# 2. Google OAuth (Same project recommended)
GOOGLE_CLIENT_ID="644504015862-..."
GOOGLE_CLIENT_SECRET="..."

# 3. This App's Private DB (Unique for each app)
MONGODB_URI="mongodb+srv://.../YOUR_NEW_APP_NAME?retryWrites=true&w=majority"
```

---

## 2. Shared Auth Setup (The AI Prompt)
Agar aap kisi AI assistant se kaam karwana chahte hain, toh bas ye prompt copy-paste karein:

> **AI Prompt for New Projects:**
> "I want to implement centralized authentication in this Next.js app using Auth.js (NextAuth v5). I want it to connect to an existing shared MongoDB database (Primadex). 
> 1. Install `next-auth@beta`, `@auth/mongodb-adapter`, and `mongodb`.
> 2. Create `lib/mongodb-client.ts` for the shared database connection using `process.env.AUTH_DATABASE_URL`.
> 3. Setup `auth.ts` using `MongoDBAdapter` and Google Provider.
> 4. Ensure that for authentication we use `AUTH_DATABASE_URL` (to share users), but for other application data we use `MONGODB_URI` (for app-specific data)."

---

## 3. Key Files Structure

### File 1: `lib/mongodb-client.ts` (Auth Connection)
NextAuth ko ye file chahiye hoti hai adapter ke liye. Ise create karein:

```typescript
import { MongoClient } from "mongodb";

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "AUTH_DATABASE_URL"');
}

const uri = process.env.AUTH_DATABASE_URL;
const options = {};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri!, options).connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri!, options).connect();
}

export default clientPromise;
```

### File 2: `auth.ts`
```typescript
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
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return !!auth?.user; // Basic protection
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.email) return;
      const client = await clientPromise;
      const db = client.db();
      
      await db.collection("users").updateOne(
        { email: user.email },
        { 
          $set: { 
            lastAppUsed: process.env.APP_NAME || "Unknown App",
            lastLoginAt: new Date()
          },
          $addToSet: { 
            authorizedApps: process.env.APP_NAME || "Unknown App" 
          }
        }
      );
    }
  }
});
```

---

## 4. Verification Flow
- **User Creation**: Jab bhi koi naya user sign-in karega, woh automatic `primadex` DB ke `users` collection mein save hoga.
- **Data Isolation**: Application ka apna data (Mongoose models) `MONGODB_URI` ka use karke alag database mein save hoga.
- **Same Identity**: 1 se 20 applications mein user ki ID (`_id`) aur Profile same rahegi.

---
