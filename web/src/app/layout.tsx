import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RootLayoutClient from "./layoutClient";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pomoAI",
  description: "AI-powered pomodoro app for focus and productivity.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  keywords: [
    "pomoAI",
    "AI",
    "pomodoro",
    "timer",
    "productivity",
    "focus",
    "task management",
    "time management",
    "work smarter",
    "get things done",
    "study",
    "work",
  ],
  openGraph: {
    title: "pomoAI",
    description: "AI-powered pomodoro app for focus and productivity.",
    url: "https://pomoai.tech",
    siteName: "pomoAI",
    images: [
      {
        url: "https://i.postimg.cc/HsYHmR7g/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
      <Script defer src="https://analytics.pomoai.tech/script.js" data-website-id="e25f45c5-62fa-4bd4-a6dc-2cf4cd8eba0c"/>
    </html>
  );
}

export const dynamic = "force-dynamic";