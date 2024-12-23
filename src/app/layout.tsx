import type { Metadata } from "next";
import ThemeProvider from "../components/ThemeProvider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "...:3....",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-screen bg-emerald-50">
        <ThemeProvider>
          {children} <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
