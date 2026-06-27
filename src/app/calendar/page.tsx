"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

// Mock fetching data
const fetchMockScores = async (year: number, month: number) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mockData: Record<string, number> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    // Random score between 1 and 5, or undefined
    if (Math.random() > 0.3) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      mockData[dateStr] = Math.floor(Math.random() * 5) + 1;
    }
  }
  return mockData;
};

const getColorForScore = (score?: number) => {
  switch (score) {
    case 1: return "bg-red-500/80 text-white border-red-500";
    case 2: return "bg-orange-400/80 text-white border-orange-400";
    case 3: return "bg-yellow-400/80 text-gray-900 border-yellow-400";
    case 4: return "bg-lime-400/80 text-gray-900 border-lime-400";
    case 5: return "bg-green-500/80 text-white border-green-500";
    default: return "bg-gray-800 text-gray-400 border-gray-700"; // Empty or no data
  }
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchMockScores(year, month);
      if (active) {
        setScores(data);
        setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <nav className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900/80 backdrop-blur-md p-4 px-6 rounded-2xl shadow-xl border border-gray-800/50 relative z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Calendar View
        </h1>
        <div className="flex gap-3">
          <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md">
            Home
          </Link>
          <Link href="/manage" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-indigo-500/20">
            Manage Data
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-800 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-10">
          <button onClick={prevMonth} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors shadow-sm text-gray-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight" suppressHydrationWarning>
            {currentDate.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors shadow-sm text-gray-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-7 gap-2 md:gap-4 mb-4">
          {weekDays.map(d => (
            <div key={d} className="text-center font-bold text-gray-500 text-xs md:text-sm uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-7 gap-2 md:gap-4">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-20 md:h-28 rounded-2xl bg-gray-900/30 border border-gray-800/30"></div>;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const score = scores[dateStr];
            
            return (
              <div 
                key={day} 
                className={`relative h-20 md:h-28 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group ${getColorForScore(score)} ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
              >
                <span className="absolute top-2 left-3 text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">{day}</span>
                {score && (
                  <div className="mt-4 flex flex-col items-center animate-in zoom-in duration-300">
                    <span className="text-2xl md:text-3xl font-black drop-shadow-sm">{score}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-gray-800/50 flex justify-center gap-6 flex-wrap text-sm font-medium">
          <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div> Terrible (1)</div>
          <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full bg-orange-400/80 shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div> Bad (2)</div>
          <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div> Okay (3)</div>
          <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full bg-lime-400/80 shadow-[0_0_10px_rgba(163,230,53,0.5)]"></div> Good (4)</div>
          <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div> Great (5)</div>
        </div>
      </div>
    </div>
  );
}
