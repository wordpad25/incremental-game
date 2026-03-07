import React from 'react';
import { EXPEDITIONS } from '../data/expeditions';

export default function ExpeditionPanel({ activeId, progress, completed, onStart, era }) {
    const activeExpedition = EXPEDITIONS.find(e => e.id === activeId);

    return (
        <div className="flex flex-col h-full gap-3 overflow-hidden">
            {/* Active Expedition */}
            <div className="flex-shrink-0 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Ongoing Mission</h3>
                {activeExpedition ? (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">{activeExpedition.icon}</div>
                            <div>
                                <div className="text-sm font-bold text-white uppercase italic">{activeExpedition.name}</div>
                                <div className="text-[10px] text-slate-400 font-semibold">{activeExpedition.description}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-blue-400">Progress</span>
                                <span className="text-slate-500">{progress} / {activeExpedition.steps} Cards</span>
                            </div>
                            <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    style={{ width: `${(progress / activeExpedition.steps) * 100}%` }}
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
                                        {isCompleted && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Completed</span>}
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-bold truncate tracking-tight">{exp.reward.label}</div>
                                </div>
                                {!isCompleted && !isActive && (
                                    <button
                                        onClick={() => onStart(exp.id)}
                                        disabled={!!activeId}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!!activeId ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : `bg-white text-black hover:bg-white active:scale-95 cursor-pointer shadow-lg border-b-4 ${era.borderColor.replace('border-', 'border-b-')}`}`}
                                    >
                                        Start
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
