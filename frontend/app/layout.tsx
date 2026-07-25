import "./globals.css";

import type { Metadata } from "next";

import { env } from "@/config/env";

export const metadata: Metadata = {
  title: env.appName,
  description: "College Student Record System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}