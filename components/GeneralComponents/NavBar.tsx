"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logoIconSmall from "@/assets/logo.png";
import { AvatarIcon, GearIcon } from "@radix-ui/react-icons";

export default function NavBar() {
  const [isHidden, setIsHidden] = useState(false);
  const { data: session } = useSession(); // Access session data
  const router = useRouter();

  const toggleNavBar = () => {
    setIsHidden(!isHidden);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (isHidden) {
    return (
      <div className="flex w-full items-center justify-center">
        <div
          className="bg-white-500 flex h-[2.5vh] w-[10vw] cursor-pointer items-center justify-center bg-white opacity-20 transition-colors duration-300 hover:bg-white hover:opacity-100"
          onClick={toggleNavBar}
        >
          <p className="text-xs"> Expand </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-18 w-full px-8">
      <div className="flex h-full items-center justify-between py-2">
        <div className="flex h-full items-center">
          <button
            onClick={toggleNavBar}
            className="mx-2 grid h-10 w-10 place-items-center rounded-lg border-2 border-fileBlue"
          >
            <AvatarIcon className="h-6 w-6 text-fileBlue" />
          </button>
          <div className="relative h-14 w-14 p-2">
            <Image src={logoIconSmall} alt="Logo" />
          </div>
          <p className="text-4xl font-extrabold italic text-textPrimary">
            APEX
          </p>
          <p className="ml-2 mt-3 text-sm text-textSecondary">v 0.1</p>
        </div>

        <div className="flex h-full items-center gap-4">
          {/* Display user information if logged in */}
          {session && session.user && (
            <div className="flex items-center space-x-2">
              <p className="text-sm text-textPrimary">{session.user.name}</p>
              {session.user.image && (
                <div className="relative h-8 w-8">
                  <Image
                    src={session.user.image}
                    alt="User Avatar"
                    layout="fill"
                    className="rounded-full"
                  />
                </div>
              )}
            </div>
          )}
          <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-fileBlue">
            <AvatarIcon className="h-6 w-6 text-fileBlue" />
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-fileBlue">
            <GearIcon className="h-6 w-6 text-fileBlue" />
          </div>
          <button
            onClick={handleSignOut}
            className="grid h-10 w-10 place-items-center rounded-lg border-2 border-fileRed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-box-arrow-in-right h-6 w-6 text-fileRed"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
              />
              <path
                fill-rule="evenodd"
                d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
