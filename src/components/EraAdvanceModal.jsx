import React from 'react';

export default function EraAdvanceModal({ era, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-slate-900 border-2 border-white/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden">
                {/* Decorative background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${era.bgGradient} opacity-20`}></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="text-7xl mb-6 animate-bounce">{era.icon}</div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-2">New Era Unlocked</h2>
                    <h1 className="text-4xl font-black text-white mb-6 uppercase italic">The {era.name} Age</h1>

                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Your collective knowledge has reached a critical mass. The world evolves to reflect your growth.
                    </p>

                    <button
                        onClick={onConfirm}
                        className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-pointer"
                    >
                        Begin the {era.name} Age
                    </button>

                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Economic Threshold Met</span>
                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                        <span>Study Requirement Met</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
