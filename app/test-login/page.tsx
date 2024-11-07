// pages/your-page.js
"use client";
import { useSession, signOut } from "next-auth/react";
import React from "react";

export default function YourPage() {
  const { data: session } = useSession(); // Retrieve session data

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" }); // Redirect to home page after sign-out
  };

  return (
    <div className="container">
      <h1>Welcome to Your Dashboard</h1>

      {/* Display session information */}
      {session ? (
        <div className="session-info">
          <p>
            <strong>Name:</strong> {session.user.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          {session.user.image && (
            <img src={session.user.image} alt="User Profile" width="50" />
          )}
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}

      {/* Sign Out Button */}
      {session && (
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      )}
    </div>
  );
}
