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
      <body className="bg-slate-950 text-slate-50 pb-16 antialiased selection:bg-blue-500/30" suppressHydrationWarning>
        {children}
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 glass-nav px-2 py-3 flex justify-around items-center max-w-md mx-auto pb-safe z-50 rounded-t-[2rem]">
          <a href="/" className="flex flex-col items-center group relative w-16">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md">📝</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">Home</span>
          </a>
          <a href="/calendar" className="flex flex-col items-center group relative w-16">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md">📅</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Calendar</span>
          </a>
          <a href="/analysis" className="flex flex-col items-center group relative w-16">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md">📊</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-400 transition-colors">Analysis</span>
          </a>
          <a href="/manage" className="flex flex-col items-center group relative w-16">
            <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md">⚙️</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-pink-400 transition-colors">Manage</span>
          </a>
        </nav>
      </body>
    </html>
  );
}
