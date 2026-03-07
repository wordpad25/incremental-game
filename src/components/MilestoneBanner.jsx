import { formatNumber } from '../utils/format';

export default function MilestoneBanner({ milestone }) {
    if (!milestone) return null;

    const isGem = milestone.rewardType === 'gems';
    return (
        <div className="absolute top-0 left-0 right-0 z-40 flex justify-center pointer-events-none animate-slideDown">
            <div className="mx-2 mt-1 bg-gradient-to-r from-amber-900/90 via-yellow-900/90 to-amber-900/90 border border-amber-500/50 rounded-xl px-4 py-2.5 shadow-[0_4px_30px_rgba(245,158,11,0.3)] backdrop-blur-sm flex items-center gap-3 max-w-xs w-full">
                <div className="text-2xl flex-shrink-0">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-amber-300 truncate">{milestone.name}</div>
                    <div className="text-[10px] font-bold text-amber-200/70">
                        +{formatNumber(milestone.rewardAmount)} {isGem ? '💎 Gems' : '🧩 Fragments'}
                    </div>
                </div>
                <div className="text-lg flex-shrink-0">🏆</div>
            </div>
        </div>
    );
}
