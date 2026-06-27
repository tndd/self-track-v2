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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 px-4 py-4 mb-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">Self-Track</h1>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col gap-8">
        <section>
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-1">Quick Log</h2>
          <ConditionButtons onLog={handleQuickLog} />
        </section>

        <section>
          <EntryComposer onEntryAdded={fetchEntries} />
        </section>

        <section>
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-1">Timeline</h2>
          {isLoading ? (
            <div className="py-12 text-center text-neutral-400 text-sm bg-white rounded-2xl border border-neutral-100">
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
