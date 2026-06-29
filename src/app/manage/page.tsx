"use client";
import React, { useState, useEffect } from "react";

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

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editDefaultIntensity, setEditDefaultIntensity] = useState<number>(1);

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
    await fetch(`/api/action-groups/${id}`, { method: "DELETE" }).catch(console.error);
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleDeleteAction = async (id: string) => {
    await fetch(`/api/actions/${id}`, { method: "DELETE" }).catch(console.error);
    setActions(actions.filter(a => a.id !== id));
  };

  const handleDeleteSymptom = async (id: string) => {
    await fetch(`/api/symptoms/${id}`, { method: "DELETE" }).catch(console.error);
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const handleAddGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = { name: formData.get("name"), color: formData.get("color"), sortOrder: Number(formData.get("sortOrder") || 0) };
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

  // Start editing handlers
  const startEditGroup = (g: ActionGroup) => {
    setEditingId(g.id);
    setEditName(g.name);
    setEditColor(g.color || "#8b5cf6");
    setEditSortOrder(g.sortOrder);
  };

  const startEditAction = (a: Action) => {
    setEditingId(a.id);
    setEditName(a.name);
    setEditGroupId(a.groupId);
    setEditDefaultIntensity(a.defaultIntensity);
    setEditSortOrder(a.sortOrder);
  };

  const startEditSymptom = (s: Symptom) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditColor(s.color || "#ef4444");
    setEditSortOrder(s.sortOrder);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateGroup = async (id: string) => {
    const body = { name: editName, color: editColor, sortOrder: editSortOrder };
    try {
      const res = await fetch(`/api/action-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const updated = await res.json();
        setGroups(groups.map(g => g.id === id ? updated : g));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAction = async (id: string) => {
    const body = { name: editName, groupId: editGroupId, defaultIntensity: editDefaultIntensity, sortOrder: editSortOrder };
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const updated = await res.json();
        setActions(actions.map(a => a.id === id ? updated : a));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSymptom = async (id: string) => {
    const body = { name: editName, color: editColor, sortOrder: editSortOrder };
    try {
      const res = await fetch(`/api/symptoms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const updated = await res.json();
        setSymptoms(symptoms.map(s => s.id === id ? updated : s));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen font-sans overflow-hidden relative">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-pink-500/20 via-purple-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-10000"></div>
      
      <header className="glass-nav sticky top-0 z-20 px-4 py-4 mb-6 flex justify-between items-center rounded-b-[2rem]">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">Manage</h1>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm shadow-inner border border-slate-700">
          👤
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 flex flex-col gap-6 pb-32 relative z-10">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 backdrop-blur-md mb-6">
            {(["groups", "actions", "symptoms"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  cancelEdit();
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                  activeTab === tab
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="glass-panel p-5 rounded-3xl flex flex-col gap-6">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400 text-sm bg-red-500/10 rounded-2xl border border-red-500/20">
                {error}
              </div>
            ) : (
              <>
                {activeTab === "groups" && (
                  <div className="animate-in fade-in duration-300">
                    <form onSubmit={handleAddGroup} className="flex flex-col gap-3 mb-6">
                      <input name="name" required placeholder="Group Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                      <div className="flex gap-3">
                        <input name="color" type="color" defaultValue="#8b5cf6" className="bg-slate-950 border border-slate-800 rounded-xl h-[38px] w-12 cursor-pointer p-0.5" />
                        <input name="sortOrder" type="number" defaultValue="0" placeholder="Sort" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                      </div>
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2 rounded-xl transition-colors">Add Group</button>
                    </form>

                    <div className="flex flex-col gap-2">
                      {groups.map(g => (
                        <div key={g.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 group transition-all">
                          {editingId === g.id ? (
                            <div className="flex flex-col gap-2">
                              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                              <div className="flex gap-2 items-center">
                                <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg h-8 w-12 cursor-pointer p-0.5" />
                                <input type="number" value={editSortOrder} onChange={(e) => setEditSortOrder(Number(e.target.value))} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none" placeholder="Sort Order" />
                              </div>
                              <div className="flex gap-2 justify-end mt-1">
                                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 bg-slate-800 rounded-lg">Cancel</button>
                                <button onClick={() => handleUpdateGroup(g.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color || '#4b5563' }}></div>
                                <span className="text-sm font-bold">{g.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => startEditGroup(g)} className="text-slate-400 hover:text-indigo-400 transition-colors p-1" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => handleDeleteGroup(g.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Delete">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "actions" && (
                  <div className="animate-in fade-in duration-300">
                    <form onSubmit={handleAddAction} className="flex flex-col gap-3 mb-6">
                      <input name="name" required placeholder="Action Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                      <select name="groupId" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                        <option value="">No Group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <div className="flex gap-3">
                        <input name="defaultIntensity" type="number" defaultValue="1" placeholder="Intensity" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                        <input name="sortOrder" type="number" defaultValue="0" placeholder="Sort" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                      </div>
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2 rounded-xl transition-colors">Add Action</button>
                    </form>

                    <div className="flex flex-col gap-2">
                      {actions.map(a => {
                        const group = groups.find(g => g.id === a.groupId);
                        return (
                          <div key={a.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 group transition-all relative">
                            {editingId === a.id ? (
                              <div className="flex flex-col gap-2">
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                                <select value={editGroupId || ""} onChange={(e) => setEditGroupId(e.target.value || null)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none">
                                  <option value="">No Group</option>
                                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                  <input type="number" value={editDefaultIntensity} onChange={(e) => setEditDefaultIntensity(Number(e.target.value))} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs" placeholder="Intensity" />
                                  <input type="number" value={editSortOrder} onChange={(e) => setEditSortOrder(Number(e.target.value))} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs" placeholder="Sort Order" />
                                </div>
                                <div className="flex gap-2 justify-end mt-1">
                                  <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 bg-slate-800 rounded-lg">Cancel</button>
                                  <button onClick={() => handleUpdateAction(a.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Save</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-bold pr-16">{a.name}</span>
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <button onClick={() => startEditAction(a)} className="text-slate-400 hover:text-indigo-400 p-1 transition-colors" title="Edit">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteAction(a.id)} className="text-slate-500 hover:text-red-400 p-1 transition-colors" title="Delete">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {group && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300" style={{ color: group.color || '#cbd5e1' }}>
                                      {group.name}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                    Int: {a.defaultIntensity}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "symptoms" && (
                  <div className="animate-in fade-in duration-300">
                    <form onSubmit={handleAddSymptom} className="flex flex-col gap-3 mb-6">
                      <input name="name" required placeholder="Symptom Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                      <div className="flex gap-3">
                        <input name="color" type="color" defaultValue="#ef4444" className="bg-slate-950 border border-slate-800 rounded-xl h-[38px] w-12 cursor-pointer p-0.5" />
                        <input name="sortOrder" type="number" defaultValue="0" placeholder="Sort" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                      </div>
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2 rounded-xl transition-colors">Add Symptom</button>
                    </form>

                    <div className="flex flex-col gap-2">
                      {symptoms.map(s => (
                        <div key={s.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 group transition-all">
                          {editingId === s.id ? (
                            <div className="flex flex-col gap-2">
                              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                              <div className="flex gap-2 items-center">
                                <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg h-8 w-12 cursor-pointer p-0.5" />
                                <input type="number" value={editSortOrder} onChange={(e) => setEditSortOrder(Number(e.target.value))} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none" placeholder="Sort Order" />
                              </div>
                              <div className="flex gap-2 justify-end mt-1">
                                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 bg-slate-800 rounded-lg">Cancel</button>
                                <button onClick={() => handleUpdateSymptom(s.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color || '#4b5563' }}></div>
                                <span className="text-sm font-bold">{s.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => startEditSymptom(s)} className="text-slate-400 hover:text-indigo-400 transition-colors p-1" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => handleDeleteSymptom(s.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Delete">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
