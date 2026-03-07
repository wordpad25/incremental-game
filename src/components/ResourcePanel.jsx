import { formatNumber } from '../utils/format';

export default function ResourcePanel({ fragments, insightGems, fragmentFlash }) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 flex-shrink-0">
            <div className={`bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-4 text-center shadow-lg relative overflow-hidden group transition-all duration-300 ${fragmentFlash ? 'ring-2 ring-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''}`}>
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight">{formatNumber(Math.floor(fragments))}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">🧩 Fragments</div>
            </div>
            <div id="gem-container" className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/40 rounded-xl p-2 sm:p-4 text-center shadow-[0_0_15px_rgba(168,85,247,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 text-[8px] font-bold text-purple-300/50 uppercase">SRS Only</div>
                <div className="text-xl sm:text-3xl font-black text-purple-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                    {formatNumber(Math.floor(insightGems))}
                </div>
                <div className="text-[10px] uppercase font-bold text-purple-300 mt-1">💎 Insight Gems</div>
            </div>
        </div>
    );
}
