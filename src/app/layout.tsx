import type { Metadata } from "next";
import { Radley } from "next/font/google";
import "./globals.css";

const inter = Radley({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Playground",
  description: "My play Arena",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
