import NextAuth, { NextAuthOptions } from "next-auth";

const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

const API_BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

if (!GOOGLE_ID || !GOOGLE_SECRET) {
  throw new Error(
    "Missing GOOGLE_ID or GOOGLE_SECRET in environment variables",
  );
}

if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in environment variables");
}

const options: NextAuthOptions = {
  callbacks: {
    async signIn({ user, profile }) {
      console.log("signIn callback triggered");
      const userId = profile?.sub;
      if (!userId || !profile) return false;

      const userData = {
        id: userId,
        name: profile.name,
        email: profile.email,
        image: user.image,
        lastLoggedIn: new Date().toISOString(),
      };

      try {
        const checkResponse = await fetch(
          `${API_BASE_URL}/api/user?id=${userId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (checkResponse.ok) {
          const updateResponse = await fetch(`${API_BASE_URL}/api/user`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: userData.id,
              lastLoggedIn: userData.lastLoggedIn,
            }),
          });

          if (!updateResponse.ok) {
            console.error(
              "Failed to update user's lastLoggedIn field:",
              updateResponse.statusText,
            );
            return false;
          }

          console.log("User's lastLoggedIn field successfully updated");
          return true;
        } else if (checkResponse.status === 404) {
          const createResponse = await fetch(`${API_BASE_URL}/api/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!createResponse.ok) {
            console.error(
              "Failed to create a new user:",
              createResponse.statusText,
            );
            return false;
          }

          console.log("New user successfully created");
          return true;
        }
      } catch (error) {
        console.error("Error during user sign-in process:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user?id=${token.sub}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          console.error("Failed to fetch user data:", response.statusText);
          return session;
        }

        const userData = await response.json();
        session.user = { ...session.user, ...userData };

        console.log("Fetched user data attached to session:", userData);
      } catch (error) {
        console.error("Error fetching user data from API:", error);
      }

      return session;
    },
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
