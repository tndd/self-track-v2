"use client";

import React from "react";

export interface TimelineEntry {
  id: string;
  timestamp: string;
  condition: number | null;
  memo: string | null;
  entryActions?: { action: { name: string }; intensity: number }[];
  entrySymptoms?: { symptom: { name: string } }[];
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function getConditionColor(cond: number) {
  switch (cond) {
    case 1: return "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-500/20 border border-red-400/20";
    case 2: return "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-500/20 border border-orange-400/20";
    case 3: return "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-500/20 border border-slate-300/50";
    case 4: return "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-emerald-500/20 border border-emerald-400/20";
    case 5: return "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-blue-500/20 border border-blue-400/20";
    default: return "bg-slate-700 text-slate-300 border border-slate-600";
  }
}

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm glass-panel rounded-3xl border-dashed">
        No entries yet. Start recording!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <div key={entry.id} className="glass-panel p-5 rounded-3xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {entry.condition !== null && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getConditionColor(entry.condition)}`}>
                  {entry.condition}
                </div>
              )}
              <div className="text-xs text-slate-400 font-bold tracking-wide" suppressHydrationWarning>
                {timeAgo(entry.timestamp)}
              </div>
            </div>
          </div>
          
          {entry.memo && (
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{entry.memo}</p>
          )}

          {(entry.entryActions?.length || entry.entrySymptoms?.length) ? (
             <div className="flex flex-wrap gap-2 mt-1">
               {entry.entryActions?.map((ea, idx) => (
                 <span key={`action-${idx}`} className="bg-indigo-500/10 text-indigo-300 text-xs px-2.5 py-1 rounded-lg font-bold border border-indigo-500/20 backdrop-blur-sm">
                   {ea.action.name} {ea.intensity > 1 && <span className="opacity-70 ml-1 text-[10px]">x{ea.intensity}</span>}
                 </span>
               ))}
               {entry.entrySymptoms?.map((es, idx) => (
                 <span key={`symptom-${idx}`} className="bg-pink-500/10 text-pink-300 text-xs px-2.5 py-1 rounded-lg font-bold border border-pink-500/20 backdrop-blur-sm">
                   {es.symptom.name}
                 </span>
               ))}
             </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
