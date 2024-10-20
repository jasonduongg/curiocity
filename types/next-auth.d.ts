// types/next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extended User interface to include DynamoDB-specific fields.
   */
  interface User {
    db_email?: string;
    db_first_name?: string;
    db_last_name?: string;
  }

  /**
   * Extended Session interface to include DynamoDB-specific fields.
   */
  interface Session {
    user: {
      db_email?: string;
      db_first_name?: string;
      db_last_name?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extended Profile interface to include given_name and family_name.
   * These are provided by the Google provider.
   */
  interface Profile {
    given_name?: string;
    family_name?: string;
    
  }
}
