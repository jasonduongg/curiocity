"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { AvatarIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";

import { useForm, SubmitHandler, FieldValues } from "react-hook-form";

// Define the form values type
interface ChangeUserFormValues extends FieldValues {
  username: string;
  email: string;
}

export default function ProfileCustomization() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Initialize useForm only if session is available
  const formMethods = useForm<ChangeUserFormValues>({
    defaultValues: {
      username: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  const onSubmit: SubmitHandler<ChangeUserFormValues> = async (data) => {
    console.log("Form Data:", data);

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user.email, // Use the email field
          name: data.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);

      alert("Updated User Profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Update Failed");
    }
  };

  // Watch for session changes and reset the form values
  useEffect(() => {
    // I am aware that useEffect should be avoided but haven't found any other solution that works yet
    if (session?.user) {
      formMethods.reset({
        username: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session, formMethods]); // Dependency array includes session and formMethods

  return (
    <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-fileBlue">
      <div
        onClick={handleOpenModal}
        className="grid h-full w-full cursor-pointer place-items-center"
      >
        <AvatarIcon className="h-6 w-6 text-fileBlue" />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="flex h-[48rem] w-[32rem] flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary p-6">
            <div className="w-fill mb-6 flex justify-between">
              <h1 className="text-3xl font-bold text-textPrimary">
                Profile Settings
              </h1>
              <div
                onClick={handleCloseModal}
                className="grid cursor-pointer place-items-center"
              >
                <Cross2Icon className="h-6 w-6 text-textPrimary" />
              </div>
            </div>

            <h5 className="text-textPrimary">Profile Picture</h5>
            <div className="my-4 grid w-full place-items-center">
              {session?.user.image ? (
                <Image
                  src={session.user.image}
                  alt={`${session.user.name}'s profile picture`}
                  width={128} // Set appropriate width
                  height={128} // Set appropriate height
                  className="h-32 w-32 rounded-full text-center text-textPrimary"
                />
              ) : (
                <p className="text-textPrimary">No user image available</p>
              )}
            </div>
            <Button
              onClick={() => {
                console.log("Click");
              }}
            >
              Change Photo
            </Button>
            {/* Use `key` on the Form to trigger re-render when `session` updates */}
            <Form
              {...formMethods}
              key={session ? session.user.email : "default"}
            >
              <form
                onSubmit={formMethods.handleSubmit(onSubmit)}
                className="mt-6 space-y-6"
              >
                <FormField
                  name="username"
                  control={formMethods.control}
                  rules={{ required: "Username is required" }}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-textPrimary">
                        Username
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter new username"
                          className="w-full rounded-md border border-textPrimary bg-bgSecondary px-4 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="email"
                  control={formMethods.control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                      message: "Enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-textPrimary">Email</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="email"
                          placeholder="Enter new email"
                          className="w-full rounded-md border border-textPrimary bg-bgSecondary px-4 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Profile
                </button>
              </form>
            </Form>
            {session && (
              <button
                type="submit"
                onClick={() => {
                  signOut({ callbackUrl: "/login" });
                }}
                className="mt-auto w-full rounded-md bg-red-600 py-2 font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Log Out
              </button>
            )}
            {!session && (
              <button
                type="submit"
                onClick={() => {
                  signIn();
                }}
                className="mt-auto w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
