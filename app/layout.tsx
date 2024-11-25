import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SwitchContextProvider } from "@/context/SwitchContext";
import { AuthProvider } from "@/context/AuthContext";
import { PostHogProvider } from "posthog-js/react";

// TODO: Replace this with the fonts that designers provide.
const geistSans = localFont({
  src: "./fonts/Geist-Regular.woff",
  variable: "--font-geist-sans",
  weight: "400",
});

export const metadata: Metadata = {
  title: "WDB Template",
  description: "A template for WDB projects!",
};

const postHogOptions = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <PostHogProvider
          apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY}
          options={postHogOptions}
        >
          <SwitchContextProvider>
            <body className={`${geistSans.variable} antialiased`}>
              {children}
            </body>
          </SwitchContextProvider>
        </PostHogProvider>
      </AuthProvider>
    </html>
  );
}
