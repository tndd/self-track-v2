import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Self-Track v2",
  description: "Track your habits and find what makes you feel best.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-gray-950 text-white pb-16" suppressHydrationWarning>
        {children}
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 px-4 py-2 flex justify-between items-center max-w-md mx-auto pb-safe z-50">
          <a href="/" className="flex flex-col items-center text-gray-400 hover:text-blue-400">
            <span className="text-xl">📝</span>
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </a>
          <a href="/calendar" className="flex flex-col items-center text-gray-400 hover:text-blue-400">
            <span className="text-xl">📅</span>
            <span className="text-[10px] mt-1 font-medium">Calendar</span>
          </a>
          <a href="/analysis" className="flex flex-col items-center text-gray-400 hover:text-blue-400">
            <span className="text-xl">📊</span>
            <span className="text-[10px] mt-1 font-medium">Analysis</span>
          </a>
          <a href="/manage" className="flex flex-col items-center text-gray-400 hover:text-blue-400">
            <span className="text-xl">⚙️</span>
            <span className="text-[10px] mt-1 font-medium">Manage</span>
          </a>
        </nav>
      </body>
    </html>
  );
}
