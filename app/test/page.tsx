"use client";
import AuthButton from "@/components/GeneralComponents/AuthButton";

import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex flex-col">
        <p>{`UserID: ${session?.user.id}`}</p>
        <p>{`(Example user data): Last Logged In: ${session?.user.lastLoggedIn}`}</p>
        <AuthButton></AuthButton>
      </div>
    </div>
  );
}
