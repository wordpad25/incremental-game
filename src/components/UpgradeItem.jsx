export default function UpgradeItem({ title, desc, cost, costType, canAfford, owned, onBuy, icon, isSpecial, isAutoBuying }) {
    const isGem = costType === 'gem';
    const containerClass = `flex items-center justify-between p-2.5 rounded-xl border transition-all ${isSpecial ? 'bg-purple-900/20 border-purple-500/30 hover:border-purple-400' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`;
    const buttonClass = `px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 ${isSpecial ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white'}`;

    return (
        <div className={containerClass}>
            <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg ${isSpecial ? 'bg-purple-900/50 text-purple-200' : 'bg-slate-900'} relative`}>
                    {icon}
                    {isAutoBuying && (
                        <div className="absolute -top-1.5 -right-1.5 bg-slate-800 border border-emerald-500/50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]" title="Auto-buying">🤖</div>
                    )}
                </div>
                <div>
                    <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                        {title}
                        {owned > 0 && <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-md text-slate-300">Lvl {owned}</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">{desc}</div>
                </div>
            </div>
            <button onClick={onBuy} disabled={!canAfford} className={buttonClass}>
                <span>{isGem ? '💎' : '🧩'}</span>
                <span>{cost}</span>
            </button>
        </div>
    );
}
