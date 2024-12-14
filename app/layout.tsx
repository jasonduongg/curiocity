import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SwitchContextProvider } from "@/context/SwitchContext";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { PHProvider } from "./providers";

const PostHogPageView = dynamic(
  () => import("../components/PostHogComponents/PostHogPageView"),
  {
    ssr: false,
  },
);

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <SwitchContextProvider>
          <PHProvider>
            <body className={`${geistSans.variable} antialiased`}>
              {children}
              <PostHogPageView />
            </body>
          </PHProvider>
        </SwitchContextProvider>
      </AuthProvider>
    </html>
  );
}
