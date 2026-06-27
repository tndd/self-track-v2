"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

type ActionGroup = { id: string; name: string; color: string | null; sortOrder: number };
type Action = { id: string; groupId: string | null; name: string; defaultIntensity: number; sortOrder: number };
type Symptom = { id: string; name: string; color: string | null; sortOrder: number };

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<"groups" | "actions" | "symptoms">("groups");
  
  const [groups, setGroups] = useState<ActionGroup[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gRes, aRes, sRes] = await Promise.all([
        fetch("/api/action-groups").catch(() => null),
        fetch("/api/actions").catch(() => null),
        fetch("/api/symptoms").catch(() => null)
      ]);
      
      if (gRes?.ok) setGroups(await gRes.json());
      if (aRes?.ok) setActions(await aRes.json());
      if (sRes?.ok) setSymptoms(await sRes.json());
      
      // If fetching fails because API doesn't exist yet, that's fine, we show empty lists.
    } catch (e) {
      console.error("Failed to load data", e);
      setError("Failed to load data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteGroup = async (id: string) => {
    await fetch(`/api/action-groups?id=${id}`, { method: "DELETE" }).catch(console.error);
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleDeleteAction = async (id: string) => {
    await fetch(`/api/actions?id=${id}`, { method: "DELETE" }).catch(console.error);
    setActions(actions.filter(a => a.id !== id));
  };

  const handleDeleteSymptom = async (id: string) => {
    await fetch(`/api/symptoms?id=${id}`, { method: "DELETE" }).catch(console.error);
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  // Forms
  const handleAddGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = { name: formData.get("name"), color: formData.get("color"), sortOrder: Number(formData.get("sortOrder") || 0) };
    
    // Optimistic UI could be used here, but we wait for simplicity
    try {
      const res = await fetch("/api/action-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const newGroup = await res.json();
        setGroups([...groups, newGroup]);
        e.currentTarget.reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = { 
      name: formData.get("name"), 
      groupId: formData.get("groupId") || null,
      defaultIntensity: Number(formData.get("defaultIntensity") || 1),
      sortOrder: Number(formData.get("sortOrder") || 0) 
    };
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const newAction = await res.json();
        setActions([...actions, newAction]);
        e.currentTarget.reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSymptom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = { name: formData.get("name"), color: formData.get("color"), sortOrder: Number(formData.get("sortOrder") || 0) };
    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const newSymptom = await res.json();
        setSymptoms([...symptoms, newSymptom]);
        e.currentTarget.reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <nav className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900/80 backdrop-blur-md p-4 px-6 rounded-2xl shadow-xl border border-gray-800/50 relative z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Manage Data
        </h1>
        <div className="flex gap-3">
          <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md">
            Home
          </Link>
          <Link href="/calendar" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-purple-500/20">
            Calendar
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 relative z-10">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
        
        <aside className="w-full md:w-64 space-y-3 shrink-0">
          {(["groups", "actions", "symptoms"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === tab 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 translate-x-2" 
                : "bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                {activeTab === tab && (
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                )}
              </div>
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-gray-800/50 shadow-2xl min-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium animate-pulse">Loading data...</p>
            </div>
          ) : error ? (
             <div className="flex items-center justify-center h-full">
               <p className="text-red-400 font-medium bg-red-400/10 px-6 py-4 rounded-xl border border-red-400/20">{error}</p>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "groups" && (
                <div>
                  <h2 className="text-3xl font-bold mb-2">Action Groups</h2>
                  <p className="text-gray-400 mb-8">Organize your actions into thematic categories.</p>
                  
                  <form onSubmit={handleAddGroup} className="mb-10 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 flex flex-wrap gap-5 items-end shadow-inner">
                    <label className="flex flex-col gap-2 flex-1 min-w-[200px]">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Group Name</span>
                      <input name="name" required className="bg-gray-950/80 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-600" placeholder="e.g. Supplements, Exercise" />
                    </label>
                    <label className="flex flex-col gap-2 w-32">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Color Theme</span>
                      <div className="relative">
                        <input name="color" type="color" defaultValue="#8b5cf6" className="bg-gray-950/80 border border-gray-700 rounded-xl h-[50px] w-full cursor-pointer p-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 w-28">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Sort Order</span>
                      <input name="sortOrder" type="number" defaultValue="0" className="bg-gray-950/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                    </label>
                    <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95 h-[50px]">
                      Add Group
                    </button>
                  </form>

                  <div className="grid gap-4">
                    {groups.map(g => (
                      <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-950/50 p-5 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all group">
                        <div className="flex items-center gap-5 mb-4 sm:mb-0">
                          <div className="w-5 h-5 rounded-full shadow-inner ring-4 ring-gray-900" style={{ backgroundColor: g.color || '#4b5563' }}></div>
                          <span className="font-bold text-lg tracking-wide">{g.name}</span>
                          <span className="text-xs font-semibold px-3 py-1.5 bg-gray-900 rounded-lg text-gray-400 border border-gray-800">Order: {g.sortOrder}</span>
                        </div>
                        <button onClick={() => handleDeleteGroup(g.id)} className="text-gray-500 hover:text-red-400 bg-gray-900 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-red-500/20 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>
                      </div>
                    ))}
                    {groups.length === 0 && (
                      <div className="text-center py-12 px-4 border-2 border-dashed border-gray-800 rounded-3xl">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-gray-400 font-medium">No action groups found.</p>
                        <p className="text-gray-600 text-sm mt-1">Create your first group above to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "actions" && (
                <div>
                  <h2 className="text-3xl font-bold mb-2">Actions</h2>
                  <p className="text-gray-400 mb-8">Specific activities, medications, or supplements you track.</p>
                  
                  <form onSubmit={handleAddAction} className="mb-10 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 flex flex-wrap gap-5 items-end shadow-inner">
                    <label className="flex flex-col gap-2 flex-1 min-w-[200px]">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Action Name</span>
                      <input name="name" required className="bg-gray-950/80 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-600" placeholder="e.g. Aspirin 500mg" />
                    </label>
                    <label className="flex flex-col gap-2 min-w-[180px]">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Group</span>
                      <select name="groupId" className="bg-gray-950/80 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white appearance-none">
                        <option value="">-- No Group --</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 w-28">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Intensity</span>
                      <input name="defaultIntensity" type="number" defaultValue="1" className="bg-gray-950/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                    </label>
                    <label className="flex flex-col gap-2 w-28">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Sort Order</span>
                      <input name="sortOrder" type="number" defaultValue="0" className="bg-gray-950/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                    </label>
                    <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95 h-[50px]">
                      Add Action
                    </button>
                  </form>

                  <div className="grid gap-4 md:grid-cols-2">
                    {actions.map(a => {
                      const group = groups.find(g => g.id === a.groupId);
                      return (
                        <div key={a.id} className="flex flex-col justify-between bg-gray-950/50 p-5 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all group">
                          <div className="flex items-start justify-between mb-4">
                            <span className="font-bold text-lg">{a.name}</span>
                            <button onClick={() => handleDeleteAction(a.id)} className="text-gray-500 hover:text-red-400 bg-gray-900 hover:bg-red-500/10 p-2 rounded-xl transition-all border border-transparent hover:border-red-500/20 sm:opacity-0 sm:group-hover:opacity-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 rounded-lg border border-gray-800">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color || '#4b5563' }}></div>
                                <span className="text-xs font-medium text-gray-300">{group.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium px-3 py-1 bg-gray-900 text-gray-500 rounded-lg border border-gray-800">Uncategorized</span>
                            )}
                            <span className="text-xs font-semibold px-3 py-1 bg-gray-900 rounded-lg text-indigo-400 border border-gray-800">Intensity: {a.defaultIntensity}</span>
                          </div>
                        </div>
                      )
                    })}
                    {actions.length === 0 && (
                      <div className="col-span-2 text-center py-12 px-4 border-2 border-dashed border-gray-800 rounded-3xl">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <p className="text-gray-400 font-medium">No actions found.</p>
                        <p className="text-gray-600 text-sm mt-1">Add actions you want to track regularly.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "symptoms" && (
                <div>
                  <h2 className="text-3xl font-bold mb-2">Symptoms</h2>
                  <p className="text-gray-400 mb-8">Bodily sensations or conditions you want to monitor.</p>
                  
                  <form onSubmit={handleAddSymptom} className="mb-10 bg-gray-800/40 p-6 md:p-8 rounded-3xl border border-gray-700/50 flex flex-wrap gap-5 items-end shadow-inner">
                    <label className="flex flex-col gap-2 flex-1 min-w-[200px]">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Symptom Name</span>
                      <input name="name" required className="bg-gray-950/80 border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-600" placeholder="e.g. Headache, Fatigue" />
                    </label>
                    <label className="flex flex-col gap-2 w-32">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Color Marker</span>
                      <div className="relative">
                        <input name="color" type="color" defaultValue="#ef4444" className="bg-gray-950/80 border border-gray-700 rounded-xl h-[50px] w-full cursor-pointer p-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 w-28">
                      <span className="text-sm font-semibold text-gray-300 ml-1">Sort Order</span>
                      <input name="sortOrder" type="number" defaultValue="0" className="bg-gray-950/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                    </label>
                    <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95 h-[50px]">
                      Add Symptom
                    </button>
                  </form>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {symptoms.map(s => (
                      <div key={s.id} className="bg-gray-950/50 p-5 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all group flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-4 h-4 rounded-full shadow-inner ring-2 ring-gray-900" style={{ backgroundColor: s.color || '#4b5563' }}></div>
                          <span className="font-bold text-lg truncate">{s.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                           <span className="text-xs font-semibold px-3 py-1.5 bg-gray-900 rounded-lg text-gray-400 border border-gray-800">Order: {s.sortOrder}</span>
                           <button onClick={() => handleDeleteSymptom(s.id)} className="text-gray-500 hover:text-red-400 bg-gray-900 hover:bg-red-500/10 p-2 rounded-xl transition-all border border-transparent hover:border-red-500/20 sm:opacity-0 sm:group-hover:opacity-100">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </div>
                    ))}
                    {symptoms.length === 0 && (
                      <div className="col-span-full text-center py-12 px-4 border-2 border-dashed border-gray-800 rounded-3xl">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <p className="text-gray-400 font-medium">No symptoms tracked.</p>
                        <p className="text-gray-600 text-sm mt-1">Add your first symptom to start monitoring it.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
