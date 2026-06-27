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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-900/50 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-gray-800">
      <h3 className="font-semibold text-lg text-white">New Entry</h3>
      
      {/* Condition Optional Selection */}
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((lvl) => (
          <button
            type="button"
            key={lvl}
            onClick={() => setCondition(condition === lvl ? null : lvl)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              condition === lvl ? "bg-white text-gray-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>
      
      <textarea
        className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-500"
        rows={3}
        placeholder="How are you feeling? Any memo?"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      
      {actions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</h4>
          <div className="flex flex-wrap gap-2">
            {actions.map((act) => {
              const isSelected = selectedActions[act.id] !== undefined;
              return (
                <div key={act.id} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors border ${isSelected ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                   <span onClick={() => toggleAction(act)} className="select-none cursor-pointer">{act.name}</span>
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
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((sym) => {
              const isSelected = selectedSymptoms.has(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors border ${isSelected ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
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
        className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 mt-2 disabled:opacity-50 transition-opacity hover:bg-blue-500 shadow-lg shadow-blue-500/20"
      >
        {isSubmitting ? "Saving..." : "Save Entry"}
      </button>
    </form>
  );
}
