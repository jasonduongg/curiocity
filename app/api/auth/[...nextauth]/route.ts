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
        image: user.image,
        lastLoggedIn: new Date().toISOString(),
      };
      console.log("Prepared user data:", userData);

      try {
        // Check if the user already exists in the database
        const checkResponse = await fetch(
          `http://localhost:3000/api/user?id=${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (checkResponse.ok) {
          // User exists, update lastLoggedIn
          const updateResponse = await fetch(`http://localhost:3000/api/user`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userData.email,
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
          return true; // Continue sign-in if the update succeeds
        } else if (checkResponse.status === 404) {
          // User does not exist, create a new user
          const createResponse = await fetch(`http://localhost:3000/api/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userData }),
          });

          if (!createResponse.ok) {
            console.error(
              "Failed to create a new user:",
              createResponse.statusText,
            );
            return false;
          }

          console.log("New user successfully created");
          return true; // Continue sign-in if the creation succeeds
        } else {
          console.error(
            "Unexpected error while checking user existence:",
            checkResponse.statusText,
          );
          return false;
        }
      } catch (error) {
        console.error("Error during user sign-in process:", error);
        return false; // Prevent sign-in if any step fails
      }
    },
    async session({ session }) {
      if (DISABLE_AUTH) return session; // Bypass session if auth is disabled

      const email = session.user?.email?.toLowerCase();
      if (!email) return session;

      try {
        // Fetch user data from your API
        const response = await fetch(
          `http://localhost:3000/api/user?id=${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          console.error("Failed to fetch user data:", response.statusText);
          return session; // Return the original session if the API call fails
        }

        const userData = await response.json();

        // Attach user data from the API to the session
        session.user.id = userData.id;
        session.user.name = userData.name;
        session.user.email = userData.email;
        session.user.image = userData.image;
        session.user.lastLoggedIn = userData.lastLoggedIn;

        console.log("Fetched user data attached to session:", userData);
      } catch (error) {
        console.error("Error fetching user data from API:", error);
      }

      return session;
    },
  },
  pages: {
    signIn: "/report-home", // Redirect to report-hoem after login
    signOut: "/login", // Redirect to login after logout
  },
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
