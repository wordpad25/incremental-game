import React, { useState, useEffect } from 'react';
import { EXPEDITIONS } from '../data/expeditions';
import { RELICS } from '../data/relics';
import { formatNumber } from '../utils/format';

export default function ExpeditionPanel({ activeId, progress, activeTarget, activeEndTime, completed, relics, onStart, era, fragments, focusShards, onForge }) {
    const activeExpedition = EXPEDITIONS.find(e => e.id === activeId);
    const [activeTab, setActiveTab] = useState('missions');

    // Timer logic
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!activeEndTime) {
            setTimeLeft('');
            return;
        }

        const tick = () => {
            const now = Date.now();
            if (now >= activeEndTime) {
                setTimeLeft('00:00');
                return;
            }
            const diff = activeEndTime - now;
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        tick();
        const intId = setInterval(tick, 1000);
        return () => clearInterval(intId);
    }, [activeEndTime, activeId]);

    return (
        <div className="flex flex-col h-full gap-3 overflow-hidden">
            <div className="flex gap-1 mb-1">
                <button
                    onClick={() => setActiveTab('missions')}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${activeTab === 'missions' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                >
                    Missions
                </button>
                <button
                    onClick={() => setActiveTab('forge')}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${activeTab === 'forge' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                >
                    Relic Forge
                </button>
            </div>

            {activeTab === 'missions' ? (
                <>
            {/* Active Expedition */}
            <div className="flex-shrink-0 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Ongoing Mission</h3>
                {activeExpedition ? (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl animate-pulse">{activeExpedition.icon}</div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white uppercase italic flex justify-between">
                                    <span>{activeExpedition.name}</span>
                                    <span className="text-amber-400 font-mono tracking-tighter">{timeLeft}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold">{activeExpedition.description}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-blue-400">Cards Reviewed</span>
                                <span className={progress >= activeTarget ? "text-emerald-400" : "text-slate-300"}>{progress} / {activeTarget}</span>
                            </div>
                            <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/50 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((progress / activeTarget) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center opacity-50">
                        <div className="text-4xl mb-2">{era.icon === '🗿' ? '🔭' : era.icon}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase italic">
                            {era.id === 1 ? 'Mapping the Territory' : 'No Active Research'}
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium">
                            {era.id === 1 ? 'Hunt for knowledge relics to begin' : 'Select a mission below to advance humanity'}
                        </div>
                    </div>
                )}
            </div>

            {/* List of Expeditions */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 px-1 tracking-widest">Available Missions</h3>
                {EXPEDITIONS.map(exp => {
                    const isCompleted = completed.includes(exp.id);
                    const isActive = activeId === exp.id;

                    return (
                        <div
                            key={exp.id}
                            className={`p-3 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : isActive ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/30'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl opacity-80">{exp.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`text-xs font-black uppercase italic ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>{exp.name}</div>
                                        {isCompleted && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Relic Acquired</span>}
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-medium truncate">{exp.description}</div>
                                    <div className="text-[9px] text-amber-500/80 font-bold mt-0.5 border border-amber-500/20 bg-amber-900/20 inline-block px-1 rounded">
                                        Goal: Review {exp.steps} cards in {Math.round(exp.steps / 3)}m
                                    </div>
                                </div>
                                {!isCompleted && !isActive && (
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="text-[10px] font-bold text-blue-400 text-right">
                                            Cost: {formatNumber(exp.steps * 100)} 🧩
                                        </div>
                                        <button
                                            onClick={() => onStart(exp.id, exp.steps * 100, exp.steps, Math.round(exp.steps / 3))}
                                            disabled={!!activeId || fragments < exp.steps * 100}
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${!!activeId || fragments < exp.steps * 100 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : `bg-white text-black hover:bg-slate-200 active:scale-95 cursor-pointer shadow-lg`}`}
                                        >
                                            Begin Run
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            </>
            ) : (
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                    <h3 className="text-[10px] sm:text-xs font-black uppercase text-amber-500 px-1 tracking-widest">Relic Synthesis Forge</h3>
                    <div className="bg-amber-900/10 border border-amber-900/30 p-3 rounded-xl mb-4">
                        <p className="text-[10px] text-amber-200/70 font-medium leading-relaxed">
                            Fuse 3 duplicate Level 1 relics + 100 Focus Shards to create a Level 2 relic with enhanced stats.
                        </p>
                    </div>

                    {Object.values(RELICS).map(relicDef => {
                        const ownedOfThis = (relics || []).filter(r => r.id === relicDef.id);
                        if (ownedOfThis.length === 0) return null;

                        // Group by level
                        const levels = [...new Set(ownedOfThis.map(r => r.level))];

                        return levels.map(lv => {
                            const count = ownedOfThis.filter(r => r.level === lv).length;
                            const canForge = count >= 3 && focusShards >= 100;

                            return (
                                <div key={`${relicDef.id}-${lv}`} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                    <div className="text-3xl">{relicDef.icon}</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-amber-400 uppercase tracking-tighter">
                                            {relicDef.name} <span className="text-white bg-amber-600 px-1 rounded ml-1">LVL {lv}</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 mt-0.5">Owned: {count}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-[10px] font-bold text-amber-500">Cost: 100 Shards</div>
                                        <button
                                            onClick={() => onForge(relicDef.id, lv)}
                                            disabled={!canForge}
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${!canForge ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] active:scale-95'}`}
                                        >
                                            Fuse 3x
                                        </button>
                                    </div>
                                </div>
                            );
                        });
                    })}
                </div>
            )}
        </div>
    );
}
