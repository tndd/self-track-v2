"use client";

import React, { useEffect, useState } from "react";

interface Combination {
  actionIds: string[];
  actionNames: string[];
  averageScore: number;
  frequency: number;
}

export default function BestCombination() {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analysis/combination")
      .then((res) => res.json())
      .then((data) => setCombinations(data.combinations || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="glass-panel h-32 rounded-3xl animate-pulse"></div>;
  }

  if (combinations.length === 0) {
    return <div className="glass-panel p-6 rounded-3xl text-center text-slate-400 text-sm border-dashed">Not enough combinations logged yet.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {combinations.slice(0, 5).map((c, idx) => {
        return (
          <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex flex-wrap gap-2">
              {c.actionNames.map((name, i) => (
                <span key={i} className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs px-3 py-1.5 rounded-lg font-bold">
                  {name}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Occurred {c.frequency} times</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Avg Score</span>
                <span className="text-lg font-black text-blue-400">{c.averageScore.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
