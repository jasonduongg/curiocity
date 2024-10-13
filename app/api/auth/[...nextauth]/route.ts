// MUST USE LOWERCASE EMAIL

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({
  region: "us-west-2",
});

const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({}) {
      return true; // Allow sign-in for other providers or if not checking
    },
    async session({ session }: { session: any }) {
      const email = session.user?.email?.toLowerCase();

      // Fetch user details from DynamoDB based on email
      const params = {
        TableName: "users",
        Key: {
          email: email,
        },
      };

      try {
        const data = await dynamoDbDocClient.send(new GetCommand(params));
        const userDetails = data.Item;

        if (userDetails) {
          const db_values = {
            db_email: userDetails.email ?? "",
            db_first_name: userDetails.first_name ?? "",
            db_last_name: userDetails.last_name ?? "",
          };

          session.user = { ...session.user, ...db_values };
        }
      } catch (error) {
        console.error("Error fetching user details from DynamoDB:", error);
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
