"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const getColorForScore = (score?: number) => {
  switch (Math.round(score || 0)) {
    case 1: return "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-500/20 border border-red-400/20";
    case 2: return "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-500/20 border border-orange-400/20";
    case 3: return "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-500/20 border border-slate-300/50";
    case 4: return "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-emerald-500/20 border border-emerald-400/20";
    case 5: return "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-blue-500/20 border border-blue-400/20";
    default: return "glass-panel text-slate-400 border border-slate-800/50"; // Empty or no data
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
      try {
        const res = await fetch(`/api/analysis/daily-scores?year=${year}&month=${month + 1}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setScores(data.scores || {});
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) {
          setLoading(false);
        }
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
    <div className="min-h-screen font-sans overflow-hidden relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-10000"></div>
        
      <header className="glass-nav sticky top-0 z-20 px-4 py-4 mb-6 flex justify-between items-center rounded-b-[2rem]">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">Calendar</h1>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm shadow-inner border border-slate-700">
          👤
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col gap-6 pb-32 relative z-10">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors shadow-sm text-slate-300 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-bold tracking-tight" suppressHydrationWarning>
                {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors shadow-sm text-slate-300 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center font-bold text-slate-500 text-[10px] uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            <div className="relative z-10 grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square rounded-2xl bg-slate-900/30 border border-slate-800/30"></div>;
                }
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const score = scores[dateStr];
                
                return (
                  <div 
                    key={day} 
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${getColorForScore(score)} ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
                  >
                    <span className="absolute top-1 left-1.5 text-[10px] font-semibold opacity-60 group-hover:opacity-100 transition-opacity">{day}</span>
                    {score !== undefined && (
                      <div className="mt-2 flex flex-col items-center animate-in zoom-in duration-300">
                        <span className="text-lg font-black drop-shadow-sm">{score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/50 flex justify-center gap-4 flex-wrap text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Bad</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Neutral</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400"></div> Good</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
