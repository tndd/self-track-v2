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
  return date.toLocaleDateString();
}

function getConditionColor(cond: number) {
  switch (cond) {
    case 1: return "bg-red-500 text-white";
    case 2: return "bg-orange-500 text-white";
    case 3: return "bg-yellow-400 text-neutral-900";
    case 4: return "bg-lime-400 text-neutral-900";
    case 5: return "bg-green-500 text-white";
    default: return "bg-neutral-500 text-white";
  }
}

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-400 text-sm bg-white rounded-2xl border border-neutral-100 border-dashed">
        No entries yet. Start recording!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-800 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {entry.condition !== null && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getConditionColor(entry.condition)}`}>
                  {entry.condition}
                </div>
              )}
              <div className="text-xs text-gray-400 font-medium">
                {timeAgo(entry.timestamp)}
              </div>
            </div>
          </div>
          
          {entry.memo && (
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{entry.memo}</p>
          )}

          {(entry.entryActions?.length || entry.entrySymptoms?.length) ? (
             <div className="flex flex-wrap gap-2 mt-1">
               {entry.entryActions?.map((ea, idx) => (
                 <span key={`action-${idx}`} className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-md font-medium border border-indigo-500/30">
                   {ea.action.name} {ea.intensity > 1 && <span className="opacity-70 ml-1 text-[10px]">x{ea.intensity}</span>}
                 </span>
               ))}
               {entry.entrySymptoms?.map((es, idx) => (
                 <span key={`symptom-${idx}`} className="bg-pink-500/20 text-pink-300 text-xs px-2 py-1 rounded-md font-medium border border-pink-500/30">
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
