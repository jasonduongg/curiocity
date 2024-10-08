import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SwitchContextProvider } from "@/context/SwitchContext";

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
      <SwitchContextProvider>
        <body className={`${geistSans.variable} antialiased`}>{children}</body>
      </SwitchContextProvider>
    </html>
  );
}
