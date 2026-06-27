"use client";

import React, { useEffect, useState } from "react";

interface Ranking {
  actionId: string;
  actionName: string;
  correlation: number;
  sampleSize: number;
}

export default function TimeLagRanking() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analysis/timelag")
      .then((res) => res.json())
      .then((data) => setRankings(data.rankings || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="glass-panel h-32 rounded-3xl animate-pulse"></div>;
  }

  const validRankings = rankings.filter(r => r.sampleSize >= 2 && Math.abs(r.correlation) > 0.1);

  if (validRankings.length === 0) {
    return <div className="glass-panel p-6 rounded-3xl text-center text-slate-400 text-sm border-dashed">Not enough data to calculate next-day effects yet.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {validRankings.map((r) => {
        const isPositive = r.correlation > 0;
        const colorClass = isPositive 
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
          : "text-rose-400 bg-rose-500/10 border-rose-500/20";
        
        return (
          <div key={r.actionId} className="glass-panel p-4 rounded-2xl flex justify-between items-center transition-transform hover:-translate-y-1">
            <div className="flex flex-col">
              <span className="font-bold text-slate-200">{r.actionName}</span>
              <span className="text-[10px] text-slate-500 font-medium">N = {r.sampleSize}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Next Day</span>
              <div className={`px-4 py-1.5 rounded-xl border font-black text-sm ${colorClass}`}>
                {r.correlation > 0 ? "+" : ""}{r.correlation.toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
