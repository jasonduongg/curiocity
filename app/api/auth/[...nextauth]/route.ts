import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-providers';
import bcrypt from 'bcrypt';

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const GOOGLE_ID = process.env.GOOGLE_ID || '';
const GOOGLE_SECRET = process.env.GOOGLE_SECRET || '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

const LOGIN_USERS_TABLE = 'curiocity-local-login-users';
const USERS_TABLE = 'curiocity-users';

// Initialize DynamoDB clients
const dynamoDbClient = new DynamoDBClient({
  region: process.env.S3_UPLOAD_REGION,
  credentials: fromEnv(),
});
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

if (!GOOGLE_ID || !GOOGLE_SECRET) {
  throw new Error(
    'Missing GOOGLE_ID or GOOGLE_SECRET in environment variables.',
  );
}

if (!NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET in environment variables.');
}

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};

        if (!email || !password) {
          throw new Error('Email and password are required.');
        }

        try {
          // Fetch user credentials from DynamoDB
          const loginParams = { TableName: LOGIN_USERS_TABLE, Key: { email } };
          const loginResponse = await ddbDocClient.send(
            new GetCommand(loginParams),
          );
          const loginRecord = loginResponse.Item;

          if (
            !loginRecord ||
            !(await bcrypt.compare(password, loginRecord.password))
          ) {
            throw new Error('Invalid email or password.');
          }

          // Fetch user details
          const userParams = {
            TableName: USERS_TABLE,
            Key: { id: loginRecord.userId },
          };
          const userResponse = await ddbDocClient.send(
            new GetCommand(userParams),
          );
          const userRecord = userResponse.Item;

          if (!userRecord) {
            throw new Error('User details not found.');
          }

          return {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            image: userRecord.image || null,
            accountCreated: userRecord.accountCreated,
            lastLoggedIn: new Date().toISOString(),
          };
        } catch (error) {
          console.error('Error during manual login:', error);
          throw new Error('Failed to log in.');
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (profile) {
        // Google Sign-in Logic
        const userId = profile.sub;
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
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            },
          );

          if (checkResponse.ok) {
            await fetch(`${API_BASE_URL}/api/user`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: userData.id,
                lastLoggedIn: userData.lastLoggedIn,
              }),
            });
            return true;
          } else if (checkResponse.status === 404) {
            await fetch(`${API_BASE_URL}/api/user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            });
            return true;
          }
        } catch (error) {
          console.error('Error during Google sign-in process:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.accountCreated = user.accountCreated;
        token.lastLoggedIn = user.lastLoggedIn;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.image,
        accountCreated: token.accountCreated,
        lastLoggedIn: token.lastLoggedIn,
      };
      return session;
    },
  },
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
