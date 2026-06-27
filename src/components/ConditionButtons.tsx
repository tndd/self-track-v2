"use client";

import React from "react";

const conditionStyles: Record<number, string> = {
  1: "bg-red-500 text-white hover:bg-red-600",
  2: "bg-orange-500 text-white hover:bg-orange-600",
  3: "bg-yellow-400 text-neutral-900 hover:bg-yellow-500",
  4: "bg-lime-400 text-neutral-900 hover:bg-lime-500",
  5: "bg-green-500 text-white hover:bg-green-600",
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
          className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl shadow-sm font-medium transition-transform active:scale-95 disabled:opacity-50 ${conditionStyles[level]}`}
        >
          <span className="text-xl font-bold">{level}</span>
          <span className="text-[10px] mt-1 opacity-90 font-semibold uppercase tracking-wider">{conditionLabels[level]}</span>
        </button>
      ))}
    </div>
  );
}
