"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logoIconSmall from "@/assets/logo.png";
import { AvatarIcon, GearIcon, TrashIcon } from "@radix-ui/react-icons";

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
            <TrashIcon className="h-6 w-6 text-fileRed" />
          </button>
        </div>
      </div>
    </div>
  );
}
