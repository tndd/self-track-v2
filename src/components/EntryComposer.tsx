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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
      <h3 className="font-semibold text-lg text-neutral-800">New Entry</h3>
      
      {/* Condition Optional Selection */}
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((lvl) => (
          <button
            type="button"
            key={lvl}
            onClick={() => setCondition(condition === lvl ? null : lvl)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              condition === lvl ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>
      
      <textarea
        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
        rows={3}
        placeholder="How are you feeling? Any memo?"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      
      {actions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Actions</h4>
          <div className="flex flex-wrap gap-2">
            {actions.map((act) => {
              const isSelected = selectedActions[act.id] !== undefined;
              return (
                <div key={act.id} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors border ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                   <span onClick={() => toggleAction(act)} className="select-none cursor-pointer">{act.name}</span>
                   {isSelected && (
                     <input
                       type="number"
                       min={1}
                       className="w-10 ml-2 bg-transparent text-center border-b border-blue-300 focus:outline-none text-sm font-medium"
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
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((sym) => {
              const isSelected = selectedSymptoms.has(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors border ${isSelected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
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
        className="w-full bg-neutral-900 text-white font-semibold rounded-xl py-3 mt-2 disabled:opacity-50 transition-opacity hover:bg-neutral-800"
      >
        {isSubmitting ? "Saving..." : "Save Entry"}
      </button>
    </form>
  );
}
