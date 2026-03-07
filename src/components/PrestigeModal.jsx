export default function PrestigeModal({ epiphanies, onConfirm, onCancel }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/50 border border-amber-500/40 rounded-2xl p-6 max-w-xs w-full mx-4 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-center">
                <div className="text-4xl mb-3">💡</div>
                <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-2">Transcend?</h2>
                <p className="text-xs text-slate-400 mb-1">You will <span className="text-red-400 font-bold">lose</span> all Fragments, Generators, and Click Power.</p>
                <p className="text-xs text-slate-400 mb-4">You will <span className="text-emerald-400 font-bold">keep</span> Insight Gems & Gem Upgrades.</p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5">
                    <div className="text-lg font-black text-amber-400">+1 Epiphany</div>
                    <div className="text-[10px] text-amber-300/70 font-semibold">Permanent +50% Fragment Production</div>
                    <div className="text-[10px] text-slate-500 mt-1">Current: {epiphanies} → {epiphanies + 1} ({Math.round((1 + (epiphanies + 1) * 0.5) * 100)}% total)</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm transition-all cursor-pointer">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20">Transcend</button>
                </div>
            </div>
        </div>
    );
}
