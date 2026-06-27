"use client";

import React from "react";

const conditionStyles: Record<number, string> = {
  1: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-500/20 border-red-400/20",
  2: "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-500/20 border-orange-400/20",
  3: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-500/20 border-slate-300/50",
  4: "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-emerald-500/20 border-emerald-400/20",
  5: "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-blue-500/20 border-blue-400/20",
};

const conditionLabels: Record<number, string> = {
  1: "Awful",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Great",
};

interface ConditionButtonsProps {
  onLog: (condition: number) => void;
  isLoading?: boolean;
}

export default function ConditionButtons({ onLog, isLoading }: ConditionButtonsProps) {
  return (
    <div className="flex w-full justify-between gap-2">
      {([1, 2, 3, 4, 5] as const).map((level) => (
        <button
          key={level}
          onClick={() => onLog(level)}
          disabled={isLoading}
          className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl shadow-lg border border-white/10 font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-90 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 ${conditionStyles[level]}`}
        >
          <span className="text-2xl font-black drop-shadow-sm">{level}</span>
          <span className="text-[9px] mt-1 opacity-90 font-bold uppercase tracking-widest">{conditionLabels[level]}</span>
        </button>
      ))}
    </div>
  );
}
