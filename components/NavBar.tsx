"use client";

import Image from "next/image";
import logoIconSmall from "../assets/logo.png";

import { AvatarIcon, GearIcon } from "@radix-ui/react-icons";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function NavBar({ documentId }: { documentId: string }) {
  return (
    <div className="h-18 w-full">
      <div className="flex h-full items-center justify-between py-2">
        <div className="flex h-full items-center">
          <div className="relative h-14 w-14 p-2">
            <Image src={logoIconSmall} alt="Logo"></Image>
          </div>
          <p className="text-4xl font-extrabold italic text-textPrimary">
            APEX
          </p>
          <p className="ml-2 mt-3 text-sm text-textSecondary">v 0.1</p>
        </div>

        <div className="flex h-full items-center gap-4">
          <div className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border-2 border-fileBlue">
            <AvatarIcon className="h-6 w-6 text-fileBlue"></AvatarIcon>
          </div>
          <div className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border-2 border-fileBlue">
            <GearIcon className="h-6 w-6 text-fileBlue"></GearIcon>
          </div>
          <DeleteConfirmationModal documentId={documentId} />
        </div>
      </div>
    </div>
  );
}
