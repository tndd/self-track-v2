"use client";

import React, { useState, useEffect } from "react";

interface Action {
  id: string;
  name: string;
  defaultIntensity: number;
}

interface Symptom {
  id: string;
  name: string;
}

export default function EntryComposer({ onEntryAdded }: { onEntryAdded: () => void }) {
  const [memo, setMemo] = useState("");
  const [condition, setCondition] = useState<number | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  
  const [selectedActions, setSelectedActions] = useState<Record<string, number>>({});
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/actions")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => setActions(data || []))
      .catch(() => setActions([]));
    
    fetch("/api/symptoms")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => setSymptoms(data || []))
      .catch(() => setSymptoms([]));
  }, []);

  const toggleAction = (action: Action) => {
    setSelectedActions((prev) => {
      const next = { ...prev };
      if (next[action.id]) {
        delete next[action.id];
      } else {
        next[action.id] = action.defaultIntensity || 1;
      }
      return next;
    });
  };

  const updateActionIntensity = (actionId: string, intensity: number) => {
    setSelectedActions((prev) => ({ ...prev, [actionId]: intensity }));
  };

  const toggleSymptom = (symptomId: string) => {
    const next = new Set(selectedSymptoms);
    if (next.has(symptomId)) {
      next.delete(symptomId);
    } else {
      next.add(symptomId);
    }
    setSelectedSymptoms(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        memo,
        condition,
        actions: Object.entries(selectedActions).map(([id, intensity]) => ({ id, intensity })),
        symptoms: Array.from(selectedSymptoms),
      };
      
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setMemo("");
        setCondition(null);
        setSelectedActions({});
        setSelectedSymptoms(new Set());
        onEntryAdded();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 glass-panel p-6 rounded-3xl">
      <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> New Entry
      </h3>
      
      {/* Condition Optional Selection */}
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((lvl) => (
          <button
            type="button"
            key={lvl}
            onClick={() => setCondition(condition === lvl ? null : lvl)}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
              condition === lvl ? "bg-slate-100 text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/80 hover:text-slate-200"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>
      
      <textarea
        className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none placeholder-slate-500 transition-all duration-300"
        rows={3}
        placeholder="How are you feeling? Any memo?"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      
      {actions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Actions</h4>
          <div className="flex flex-wrap gap-2">
            {actions.map((act) => {
              const isSelected = selectedActions[act.id] !== undefined;
              return (
                <div key={act.id} className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-all duration-300 border ${isSelected ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105'}`}>
                   <span onClick={() => toggleAction(act)} className="select-none cursor-pointer font-medium">{act.name}</span>
                   {isSelected && (
                     <input
                       type="number"
                       min={1}
                       className="w-10 ml-2 bg-transparent text-center border-b border-indigo-500 focus:outline-none text-sm font-medium"
                       value={selectedActions[act.id]}
                       onChange={(e) => updateActionIntensity(act.id, parseInt(e.target.value) || 1)}
                     />
                   )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {symptoms.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((sym) => {
              const isSelected = selectedSymptoms.has(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border ${isSelected ? 'bg-pink-500/20 border-pink-400/50 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.2)]' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105'}`}
                >
                  {sym.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || (!memo && condition === null && Object.keys(selectedActions).length === 0 && selectedSymptoms.size === 0)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl py-4 mt-4 disabled:opacity-50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
      >
        {isSubmitting ? "Saving..." : "Save Entry"}
      </button>
    </form>
  );
}
