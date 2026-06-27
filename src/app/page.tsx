"use client";

import React, { useState, useEffect, useCallback } from "react";
import ConditionButtons from "@/components/ConditionButtons";
import EntryComposer from "@/components/EntryComposer";
import Timeline, { TimelineEntry } from "@/components/Timeline";

export default function Home() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/entries");
      if (res.ok) {
        const data = await res.json();
        setEntries(data || []);
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

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10 px-4 py-4 mb-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Self-Track</h1>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col gap-8 pb-24 relative z-10">
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Quick Log</h2>
          <ConditionButtons onLog={handleQuickLog} />
        </section>

        <section>
          <EntryComposer onEntryAdded={fetchEntries} />
        </section>

        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Timeline</h2>
          {isLoading ? (
            <div className="py-12 text-center text-gray-400 text-sm bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <div className="animate-pulse">Loading entries...</div>
            </div>
          ) : (
            <Timeline entries={entries} />
          )}
        </section>
      </main>
    </div>
  );
}
