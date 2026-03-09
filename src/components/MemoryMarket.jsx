import React from 'react';
import { CONSUMABLES } from '../data/consumables';

export default function MemoryMarket({ sparks, shards, cores, activeBuffs, onBuy }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-2 px-1 tracking-widest flex-shrink-0">Memory Market</h3>

            <div className="overflow-y-auto pr-1 space-y-2 flex-1 scrollbar-thin">
                {Object.values(CONSUMABLES).map(item => {
                    const expiry = activeBuffs[item.id];
                    const isActive = expiry && expiry > Date.now();
                    const timeLeft = isActive ? Math.ceil((expiry - Date.now()) / 60000) : 0;

                    let canAfford = false;
                    let currencyIcon = '';
                    if (item.costType === 'spark') { canAfford = sparks >= item.cost; currencyIcon = '⚡'; }
                    if (item.costType === 'shard') { canAfford = shards >= item.cost; currencyIcon = '✨'; }
                    if (item.costType === 'core') { canAfford = cores >= item.cost; currencyIcon = '🛡️'; }

                    return (
                        <div key={item.id} className={`p-3 rounded-xl border transition-all ${isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/30 border-slate-700/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{item.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-black text-slate-200 uppercase italic">{item.name}</div>
                                        {isActive && (
                                            <span className="text-[9px] font-black text-indigo-400 uppercase animate-pulse">
                                                Active ({timeLeft}m left)
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-medium">{item.desc}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="text-[10px] font-bold text-slate-400">
                                        Cost: {item.cost} {currencyIcon}
                                    </div>
                                    <button
                                        onClick={() => onBuy(item.id)}
                                        disabled={isActive || !canAfford}
                                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${isActive ? 'bg-indigo-600 text-white cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200 active:scale-95 cursor-pointer shadow-lg'}`}
                                    >
                                        {isActive ? 'Applied' : 'Inject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
