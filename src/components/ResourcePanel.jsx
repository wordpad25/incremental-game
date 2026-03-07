import { formatNumber } from '../utils/format';

export default function ResourcePanel({ fragments, insightGems, claritySparks, focusShards, resilienceCores, fragmentFlash }) {
    return (
        <div className="flex flex-col gap-2 mb-2 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className={`bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-4 text-center shadow-lg relative overflow-hidden group transition-all duration-300 ${fragmentFlash ? 'ring-2 ring-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''}`}>
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight">{formatNumber(Math.floor(fragments))}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">🧩 Fragments</div>
                </div>
                <div id="gem-container" className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-2 sm:p-4 text-center shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 text-[8px] font-bold text-purple-300/40 uppercase">Premium</div>
                    <div className="text-xl sm:text-3xl font-black text-purple-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                        {formatNumber(Math.floor(insightGems))}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-purple-300 mt-1">💎 Insight Gems</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-1 sm:gap-2">
                <div className="bg-slate-900/50 border border-yellow-500/20 rounded-lg p-1.5 text-center flex flex-col items-center justify-center">
                    <div className="text-[10px] sm:text-xs font-black text-yellow-500 font-mono tracking-tight">{formatNumber(Math.floor(claritySparks))}</div>
                    <div className="text-[8px] uppercase font-bold text-yellow-500/70 mt-0.5">✨ Sparks</div>
                </div>
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-1.5 text-center flex flex-col items-center justify-center">
                    <div className="text-[10px] sm:text-xs font-black text-orange-500 font-mono tracking-tight">{formatNumber(Math.floor(focusShards))}</div>
                    <div className="text-[8px] uppercase font-bold text-orange-500/70 mt-0.5">🔥 Shards</div>
                </div>
                <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-1.5 text-center flex flex-col items-center justify-center">
                    <div className="text-[10px] sm:text-xs font-black text-red-500 font-mono tracking-tight">{formatNumber(Math.floor(resilienceCores))}</div>
                    <div className="text-[8px] uppercase font-bold text-red-500/70 mt-0.5">🛡️ Cores</div>
                </div>
            </div>
        </div>
    );
}
