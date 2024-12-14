"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/manual-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Redirect to the desired page on successful login
      router.push("/report-home");
    } catch (err) {
      console.error("Error during login:", err);
      setError("Failed to log in. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-bgPrimary">
      <div
        className="flex w-full max-w-[452px] flex-col items-center space-y-5 p-10"
        style={{ paddingTop: "7vh" }}
      >
        {/* APEX Text and Version */}
        <div className="flex items-baseline space-x-1.5">
          <h1 className="text-[48px] font-extrabold italic text-textPrimary">
            APEX
          </h1>
          <span className="text-[24px] text-[#64516E]">v 0.1</span>
        </div>

        {/* Header Section */}
        <div className="space-y-3 text-center">
          <h1 className="text-[38px] font-extrabold text-textPrimary">
            Log In
          </h1>
          <p className="text-[14px] text-textSecondary">Welcome Back!</p>
        </div>

        {/* Login Form */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <InputField
            id="email"
            label="Email"
            type="email"
            placeholder="johndoe@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Error Message */}
          {error && <p className="text-red-600">{error}</p>}

          {/* Login Button */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <button
                type="submit"
                className="h-[40px] w-[320px] rounded-lg py-2.5 text-white transition"
                style={{ backgroundColor: "rgba(100, 81, 110, 0.6)" }}
              >
                Log In
              </button>
            </div>

            {/* Placeholder button for google auth. This button is not in the figma but unsure on login button  */}
            <div className="flex cursor-pointer justify-center">
              <div
                onClick={() =>
                  signIn("google", { callbackUrl: "/report-home" })
                } // Add onClick event for Google login
                className="grid h-[40px] w-[320px] place-items-center rounded-lg py-2.5 text-center text-white transition"
                style={{ backgroundColor: "rgba(100, 81, 110, 0.6)" }}
              >
                Log In with Google
              </div>
            </div>

            {/* Links Section */}
            <LinksSection />
          </div>
        </form>
      </div>
    </div>
  );
}

const InputField = ({ id, label, type, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label
      htmlFor={id}
      className="block text-[14px] font-medium text-textPrimary"
    >
      {label}
    </label>
    <div className="flex h-10 w-full items-center rounded-lg bg-[#64516E]/20 px-3 py-1.5">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-full w-full bg-transparent text-textPrimary placeholder-textSecondary focus:outline-none"
      />
    </div>
  </div>
);

const LinksSection = () => (
  <div className="space-y-3 text-center">
    <LinkItem text="Don’t have an account?" linkText="Sign-Up" href="/signup" />
    <LinkItem text="Forgot Password?" linkText="Reset Password" href="#" />
  </div>
);

const LinkItem = ({ text, linkText, href }) => (
  <p className="pt-1.5 text-[14px] text-textPrimary">
    <span className="underline decoration-textPrimary underline-offset-2">
      {text}
    </span>{" "}
    <a
      href={href}
      className="text-textSecondary underline decoration-textSecondary underline-offset-2"
    >
      {linkText}
    </a>
  </p>
);
