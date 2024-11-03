import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";

if (!DISABLE_AUTH && (!GOOGLE_ID || !GOOGLE_SECRET)) {
  throw new Error(
    "Missing GOOGLE_ID or GOOGLE_SECRET in environment variables",
  );
}

if (!DISABLE_AUTH && !NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in environment variables");
}

const options: NextAuthOptions = {
  providers: DISABLE_AUTH
    ? [] // No providers if auth is disabled
    : [
        GoogleProvider({
          clientId: GOOGLE_ID!,
          clientSecret: GOOGLE_SECRET!,
          authorization: {
            params: {
              scope: "openid email profile",
            },
          },
          profile(profile) {
            return {
              id: profile.sub,
              name: profile.name || "",
              email: profile.email || "",
              image: profile.picture || "",
              given_name: profile.given_name || "",
              family_name: profile.family_name || "",
            };
          },
        }),
      ],
  callbacks: {
    async signIn({ user, profile }) {
      console.log("signIn callback triggered"); // Check if callback is triggered
      console.log(user, profile);
      if (DISABLE_AUTH) return true; // Bypass auth if disabled

      const email = user.email?.toLowerCase();
      if (!email) return false;

      if (!profile) {
        console.error("Profile is undefined during sign-in.");
        return false;
      }

      // Prepare user data to send to the backend
      const userData = {
        userId: profile.sub,
        name: profile.name,
        email: profile.email,
        lastLoggedIn: new Date().toISOString(),
      };
      console.log(userData);

      if (userData.userId && userData.name && userData.email) {
        try {
          // Use fetch to call the backend API route
          const response = await fetch(`http://localhost:3000/api/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userData }),
          });

          if (!response.ok) {
            console.error(
              "Failed to save user to DynamoDB:",
              response.statusText,
            );
            return false;
          }

          console.log("User successfully saved or updated in DynamoDB");
          return true; // Continue sign-in if the API call succeeds
        } catch (error) {
          console.error("Failed to save user to DynamoDB:", error);
          return false; // Prevent sign-in if the API call fails
        }
      }

      // // return false; // Prevent sign-in if essential data is missing
      return true;
    },
    async session({ session, token }) {
      if (DISABLE_AUTH) return session; // Bypass session if auth is disabled

      const email = session.user?.email?.toLowerCase();
      if (!email) return session;

      // Attach user ID to the session
      session.user.id = token.sub;
      session.user.lastLoggedIn = new Date().toISOString();

      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/report-home`;
    },
  },
  secret: DISABLE_AUTH ? undefined : NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
