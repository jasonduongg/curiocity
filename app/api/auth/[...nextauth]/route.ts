import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!GOOGLE_ID || !GOOGLE_SECRET) {
  throw new Error(
    "Missing GOOGLE_ID or GOOGLE_SECRET in environment variables",
  );
}

if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in environment variables");
}

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
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
      console.log("signIn callback triggered");
      const email = user.email?.toLowerCase();
      if (!email || !profile) return false;

      const userData = {
        userId: profile.sub,
        name: profile.name,
        email: profile.email,
        lastLoggedIn: new Date().toISOString(),
      };
      console.log(userData);

      try {
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
        return true;
      } catch (error) {
        console.error("Failed to save user to DynamoDB:", error);
        return false;
      }
    },
    async session({ session, token }) {
      const email = session.user?.email?.toLowerCase();
      if (email) {
        session.user.id = token.sub;
        session.user.lastLoggedIn = new Date().toISOString();
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/report-home`;
    },
  },
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
