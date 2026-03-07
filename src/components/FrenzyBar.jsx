import { FRENZY_MAX_STACKS, FRENZY_BONUS_PER_STACK } from '../hooks/useGameState';

export default function FrenzyBar({ stacks }) {
    if (stacks <= 0) return null;
    const pct = (stacks / FRENZY_MAX_STACKS) * 100;
    const bonus = Math.round(stacks * FRENZY_BONUS_PER_STACK * 100);

    let barColor, glowColor, tierLabel;
    if (stacks >= 16) { barColor = 'from-orange-500 via-red-500 to-yellow-400'; glowColor = 'shadow-[0_0_20px_rgba(251,146,60,0.5)]'; tierLabel = '🔥🔥🔥'; }
    else if (stacks >= 11) { barColor = 'from-orange-500 to-red-500'; glowColor = 'shadow-[0_0_12px_rgba(239,68,68,0.4)]'; tierLabel = '🔥🔥'; }
    else if (stacks >= 6) { barColor = 'from-amber-400 to-orange-500'; glowColor = 'shadow-[0_0_8px_rgba(245,158,11,0.3)]'; tierLabel = '🔥'; }
    else { barColor = 'from-blue-400 to-cyan-400'; glowColor = ''; tierLabel = '⚡'; }

    return (
        <div className="mb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-400">{tierLabel} Study Frenzy ×{stacks}</span>
                <span className="text-[10px] font-bold text-amber-400">+{bonus}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div className={`h-full bg-gradient-to-r ${barColor} ${glowColor} rounded-full transition-all duration-500 ease-out ${stacks >= 16 ? 'animate-pulse' : ''}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
