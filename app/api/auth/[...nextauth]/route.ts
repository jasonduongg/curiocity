import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// Validate Environment Variables
const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "curiocity-users";
const AWS_REGION = process.env.AWS_REGION ?? "us-west-1";

if (!GOOGLE_ID || !GOOGLE_SECRET) {
  throw new Error("Missing GOOGLE_ID or GOOGLE_SECRET in environment variables");
}

if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in environment variables");
}

// Initialize DynamoDB Client
const dynamoDbClient = new DynamoDBClient({
  region: AWS_REGION,
});

const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

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
      // Custom profile callback to extract given_name and family_name
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
    async signIn({ user, account, profile }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      if (!profile) {
        console.error("Profile is undefined during sign-in.");
        return false;
      }

      return true;

      // const params = {
      //   TableName: DYNAMODB_TABLE_NAME,
      //   Key: { email },
      // };

      // try {
      //   const data = await dynamoDbDocClient.send(new GetCommand(params));
      //   if (!data.Item) {
      //     // Create new user in DynamoDB using given_name and family_name
      //     const newUser = {
      //       email,
      //       first_name: profile.given_name || "",
      //       last_name: profile.family_name || "",
      //     };
      //     await dynamoDbDocClient.send(
      //       new PutCommand({
      //         TableName: DYNAMODB_TABLE_NAME,
      //         Item: newUser,
      //         ConditionExpression: "attribute_not_exists(email)",
      //       })
      //     );
      //   }
      //   return true;
      // } catch (error: any) {
      //   if (error.name === "ConditionalCheckFailedException") {
      //     console.warn(`User with email ${email} already exists.`);
      //     return true; // User already exists, proceed with sign-in
      //   }
      //   console.error("Error during sign-in process:", error);
      //   return false;
      // }
    },
    async session({ session, token }) {
      const email = session.user?.email?.toLowerCase();

      if (!email) return session;

      const params = {
        TableName: DYNAMODB_TABLE_NAME,
        Key: { email },
      };

      // try {
      //   const data = await dynamoDbDocClient.send(new GetCommand(params));
      //   const userDetails = data.Item;

      //   if (userDetails) {
      //     session.user = {
      //       ...session.user,
      //       db_email: userDetails.email ?? "",
      //       db_first_name: userDetails.first_name ?? "",
      //       db_last_name: userDetails.last_name ?? "",
      //     };
      //   }
      // } catch (error) {
      //   console.error("Error fetching user details from DynamoDB:", error);
      // }

      return session;
    },
  },
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
