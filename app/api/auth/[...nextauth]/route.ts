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
      if (DISABLE_AUTH) return true; // Bypass auth if disabled

      const email = user.email?.toLowerCase();
      if (!email) return false;

      if (!profile) {
        console.error("Profile is undefined during sign-in.");
        return false;
      }

      return true;
    },
    async session({ session }) {
      if (DISABLE_AUTH) return session; // Bypass session if auth is disabled

      const email = session.user?.email?.toLowerCase();
      if (!email) return session;

      return session;
    },
  },
  secret: DISABLE_AUTH ? undefined : NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
