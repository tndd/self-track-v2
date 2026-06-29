"use client";

import React from "react";
import CorrelationRanking from "@/components/analysis/CorrelationRanking";
import BestCombination from "@/components/analysis/BestCombination";
import TimeLagRanking from "@/components/analysis/TimeLagRanking";

export default function AnalysisPage() {
  return (
    <div className="min-h-screen font-sans overflow-hidden relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/20 via-pink-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-10000"></div>
        
      <header className="glass-nav sticky top-0 z-20 px-4 py-4 mb-6 flex justify-between items-center rounded-b-[2rem]">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent drop-shadow-sm">Analysis</h1>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col gap-10 pb-32 relative z-10">
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-slate-300 tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            Direct Impact
            <span className="text-[10px] text-slate-500 ml-auto font-medium">Same-Day Correlation</span>
          </h2>
          <CorrelationRanking />
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-sm font-bold text-slate-300 tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
            Best Combinations
            <span className="text-[10px] text-slate-500 ml-auto font-medium">Synergies</span>
          </h2>
          <BestCombination />
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <h2 className="text-sm font-bold text-slate-300 tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
            Next-Day Effects
            <span className="text-[10px] text-slate-500 ml-auto font-medium">Time-Lag Correlation</span>
          </h2>
          <TimeLagRanking />
        </section>

      </main>
    </div>
  );
}
