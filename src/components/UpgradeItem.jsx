export default function UpgradeItem({ title, desc, cost, costType, canAfford, owned, onBuy, icon, isSpecial, isAutoBuying }) {

    let borderColors = 'bg-slate-800/50 border-slate-700 hover:bg-slate-800';
    let buttonColor = 'bg-blue-600 hover:bg-blue-500 text-white';
    let iconBg = 'bg-slate-900/50';
    let currencyIcon = '🧩';

    if (isSpecial) {
        if (costType === 'gem') {
            borderColors = 'bg-purple-900/20 border-purple-500/30 hover:border-purple-400';
            buttonColor = 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20';
            iconBg = 'bg-purple-900/50 text-purple-200';
            currencyIcon = '💎';
        } else if (costType === 'spark') {
            borderColors = 'bg-yellow-900/20 border-yellow-500/30 hover:border-yellow-400';
            buttonColor = 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-500/20';
            iconBg = 'bg-yellow-900/50 text-yellow-200';
            currencyIcon = '✨';
        } else if (costType === 'shard') {
            borderColors = 'bg-orange-900/20 border-orange-500/30 hover:border-orange-400';
            buttonColor = 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20';
            iconBg = 'bg-orange-900/50 text-orange-200';
            currencyIcon = '🔥';
        } else if (costType === 'core') {
            borderColors = 'bg-red-900/20 border-red-500/30 hover:border-red-400';
            buttonColor = 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20';
            iconBg = 'bg-red-900/50 text-red-200';
            currencyIcon = '🛡️';
        }
    }

    const containerClass = `flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border transition-all gap-2 sm:gap-0 ${borderColors}`;
    const btnClass = `px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-1 w-full sm:w-auto ${buttonColor}`;

    return (
        <div className={containerClass}>
            <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg ${iconBg} relative shrink-0`}>
                    {icon}
                    {isAutoBuying && (
                        <div className="absolute -top-1.5 -right-1.5 bg-slate-800 border border-emerald-500/50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]" title="Auto-buying">🤖</div>
                    )}
                </div>
                <div className="min-w-0 pr-2">
                    <div className="font-bold text-sm text-slate-200 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{title}</span>
                        {owned > 0 && <span className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded-md text-slate-300 whitespace-nowrap">Lvl {owned}</span>}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 line-clamp-2">{desc}</div>
                </div>
            </div>
            <button onClick={onBuy} disabled={!canAfford} className={btnClass}>
                <span>{currencyIcon}</span>
                <span>{cost}</span>
            </button>
        </div>
    );
}
