"use client";

import React, { useState, useEffect, useCallback } from "react";
import ConditionButtons from "@/components/ConditionButtons";
import EntryComposer from "@/components/EntryComposer";
import Timeline, { TimelineEntry } from "@/components/Timeline";
import ConditionCurve from "@/components/ConditionCurve";

export default function Home() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/entries?limit=50");
      if (res.ok) {
        const data = await res.json();
        // Support both paginated { entries: [...] } and legacy array format
        setEntries(data.entries || data || []);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error(err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleQuickLog = async (condition: number) => {
    try {
      await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition }),
      });
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extract today's condition logs for the curve
  const todayEntries = entries.filter((e) => {
    const entryDate = new Date(e.timestamp);
    const now = new Date();
    // Compare in JST
    const jstOffset = 9 * 60 * 60 * 1000;
    const entryJST = new Date(entryDate.getTime() + jstOffset);
    const nowJST = new Date(now.getTime() + jstOffset);
    return (
      entryJST.getUTCFullYear() === nowJST.getUTCFullYear() &&
      entryJST.getUTCMonth() === nowJST.getUTCMonth() &&
      entryJST.getUTCDate() === nowJST.getUTCDate()
    );
  });

  const conditionPoints = todayEntries
    .filter((e) => e.condition !== null)
    .map((e) => ({
      timestamp: e.timestamp,
      condition: e.condition as number,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="min-h-screen font-sans overflow-hidden relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/20 via-indigo-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-10000"></div>
        
      <header className="glass-nav sticky top-0 z-20 px-4 py-4 mb-6 flex justify-between items-center rounded-b-[2rem]">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">Self-Track</h1>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm shadow-inner border border-slate-700">
          👤
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col gap-8 pb-32 relative z-10">
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Quick Log
          </h2>
          <ConditionButtons onLog={handleQuickLog} />
        </section>

        {/* Condition Curve - today's trend */}
        {conditionPoints.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Today&apos;s Trend
            </h2>
            <ConditionCurve points={conditionPoints} />
          </section>
        )}

        <section>
          <EntryComposer onEntryAdded={fetchEntries} />
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
            <span className="w-1 h-3 rounded-full bg-indigo-500"></span> Timeline
          </h2>
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm glass-panel rounded-3xl">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Loading entries...
              </div>
            </div>
          ) : (
            <Timeline entries={entries} onDelete={handleDeleteEntry} />
          )}
        </section>
      </main>
    </div>
  );
}
