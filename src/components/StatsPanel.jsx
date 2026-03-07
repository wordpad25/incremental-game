import { formatNumber } from '../utils/format';

export default function StatsPanel({ totalCardsReviewed, totalFragmentsEarned, totalGemsEarned, totalClicks, totalResets, epiphanies, fragmentsPerSec, frenzyStacks, onClose }) {
    const stats = [
        { label: 'Cards Reviewed', value: formatNumber(totalCardsReviewed), icon: '📖' },
        { label: 'Fragments Earned', value: formatNumber(totalFragmentsEarned), icon: '🧩' },
        { label: 'Gems Earned', value: formatNumber(totalGemsEarned), icon: '💎' },
        { label: 'Manual Clicks', value: formatNumber(totalClicks), icon: '🖱️' },
        { label: 'Prestige Resets', value: totalResets.toString(), icon: '🔄' },
        { label: 'Epiphany Bonus', value: `${((1 + epiphanies * 0.5) * 100).toFixed(0)}%`, icon: '💡' },
        { label: 'Fragments/sec', value: formatNumber(fragmentsPerSec), icon: '⚡' },
        { label: 'Frenzy Bonus', value: frenzyStacks > 0 ? `+${frenzyStacks * 10}%` : '—', icon: '🔥' },
    ];

    return (
        <div className="mb-2 flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">📊 Lifetime Stats</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {stats.map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{s.icon} {s.label}</span>
                        <span className="text-[10px] font-bold text-slate-300 font-mono">{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
