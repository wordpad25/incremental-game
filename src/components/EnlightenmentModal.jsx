export default function EnlightenmentModal({ enlightenments, onConfirm, onCancel }) {
    const nextMultiplier = Math.pow(2, enlightenments + 1);
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-300/50 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-[0_0_60px_rgba(255,255,255,0.2)] text-center relative overflow-hidden">
                {/* Radiant glow effect behind content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="text-5xl mb-3 relative z-10 animate-pulse">🕊️</div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-2 relative z-10">True Enlightenment</h2>
                <p className="text-xs text-slate-400 mb-2 relative z-10">
                    You will <span className="text-red-400 font-bold">reset</span> Epiphanies, Fragments, Generators, and Click Power.
                </p>
                <p className="text-xs text-slate-400 mb-5 relative z-10">
                    You will <span className="text-emerald-400 font-bold">keep</span> Insight Gems, Gem Upgrades, and Stats.
                </p>

                <div className="bg-slate-800/80 border border-slate-500/50 rounded-xl p-4 mb-6 relative z-10 shadow-inner">
                    <div className="text-xl font-black text-slate-100">+1 Enlightenment</div>
                    <div className="text-xs text-emerald-300 font-bold mt-1">Permanent ×2 Multiplier to All Production!</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        Current Multiplier: ×{Math.pow(2, enlightenments)} → <span className="text-white font-bold">×{nextMultiplier}</span>
                    </div>
                </div>

                <div className="flex gap-3 relative z-10">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all cursor-pointer">
                        Turn Back
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-slate-200 to-white hover:from-white hover:to-slate-100 text-slate-900 font-black text-sm transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        Ascend
                    </button>
                </div>
            </div>
        </div>
    );
}
