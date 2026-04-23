import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicNudge",
  description: "Turn government policy into targeted community action",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmMono.variable}`}
        style={{ fontFamily: "var(--font-dm-sans), sans-serif", background: "#f6f5f2", margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}
