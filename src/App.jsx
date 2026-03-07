import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { formatNumber } from './utils/format';
import { GENERATORS, calcGeneratorCost } from './data/generators';
import { ERAS } from './data/eras';

// Components
import FrenzyBar from './components/FrenzyBar';
import UpgradeItem from './components/UpgradeItem';
import MilestoneBanner from './components/MilestoneBanner';
import StatsPanel from './components/StatsPanel';
import OfflineModal from './components/OfflineModal';
import PrestigeModal from './components/PrestigeModal';
import EnlightenmentModal from './components/EnlightenmentModal';
import EraAdvanceModal from './components/EraAdvanceModal';
import ExpeditionPanel from './components/ExpeditionPanel';
import ResourcePanel from './components/ResourcePanel';

export default function App() {
    const state = useGameState();
    const [showStats, setShowStats] = useState(false);
    const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false);
    const [showEnlightenConfirm, setShowEnlightenConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('upgrades');

    const currentEra = ERAS.find(e => e.id === state.era) || ERAS[0];

    if (state.isLoading) {
        return (
            <div className="h-full w-full bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full w-full bg-[#0a0a0f] text-slate-200 flex flex-col p-2 sm:p-4 relative overflow-hidden select-none font-sans transition-colors duration-1000 bg-gradient-to-br ${currentEra.bgGradient}`}>
            <MilestoneBanner milestone={state.activeBanner} />

            {state.pendingEraAdvance && (
                <EraAdvanceModal
                    era={state.pendingEraAdvance}
                    onConfirm={state.handleAdvanceEra}
                />
            )}

            {state.offlineReport && (
                <OfflineModal
                    offlineReport={state.offlineReport}
                    onDismiss={() => state.setOfflineReport(null)}
                />
            )}

            {showPrestigeConfirm && (
                <PrestigeModal
                    epiphanies={state.epiphanies}
                    onConfirm={() => { state.handlePrestige(); setShowPrestigeConfirm(false); }}
                    onCancel={() => setShowPrestigeConfirm(false)}
                />
            )}

            {showEnlightenConfirm && (
                <EnlightenmentModal
                    enlightenments={state.enlightenments}
                    onConfirm={() => { state.handleEnlighten(); setShowEnlightenConfirm(false); }}
                    onCancel={() => setShowEnlightenConfirm(false)}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div>
                        <h1 className={`text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentEra.id === 1 ? 'from-amber-600 to-amber-900' : 'from-blue-400 to-emerald-400'}`}>
                            Incremental Knowledge: {currentEra.name}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">{formatNumber(state.fragmentsPerSec)} Fragments / sec</p>
                    </div>
                    {state.epiphanies > 0 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-1.5 py-0.5 rounded-md border border-amber-500/30">
                            💡×{state.epiphanies}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {state.streak > 0 && (
                        <div className="flex items-center gap-1 bg-orange-500/20 px-1.5 py-0.5 rounded-lg border border-orange-500/30">
                            <span className="text-xs">🔥</span>
                            <span className="text-[10px] font-black text-orange-400">{state.streak}</span>
                        </div>
                    )}
                    <button onClick={() => setShowStats(p => !p)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${showStats ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
                        📊
                    </button>
                    <div className={`flex items-center gap-1.5 transition-opacity duration-500 ${state.saveFlash ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-[9px] text-emerald-400/70 font-semibold uppercase">Saved</span>
                    </div>
                </div>
            </div>

            {showStats && (
                <StatsPanel
                    totalCardsReviewed={state.totalCardsReviewed}
                    totalFragmentsEarned={state.totalFragmentsEarned}
                    totalGemsEarned={state.totalGemsEarned}
                    totalClicks={state.totalClicks}
                    totalResets={state.totalResets}
                    epiphanies={state.epiphanies}
                    fragmentsPerSec={state.fragmentsPerSec}
                    frenzyStacks={state.frenzyStacks}
                    onClose={() => setShowStats(false)}
                />
            )}

            <ResourcePanel
                fragments={state.fragments}
                insightGems={state.insightGems}
                fragmentFlash={state.fragmentFlash}
            />

            <div className="space-y-1 mb-2">
                <FrenzyBar stacks={state.frenzyStacks} />

                {/* Combo & Focus Burst Bar */}
                <div className="flex items-center gap-2 h-2.5 relative">
                    <div className={`flex-1 h-full bg-slate-950/50 rounded-full overflow-hidden border ${state.focusBurstTime > 0 ? 'border-yellow-400/50 shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'border-slate-800/50'} flex relative`}>
                        {state.focusBurstTime > 0 ? (
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-[pulse_1s_ease-in-out_infinite] transition-all duration-1000"
                                style={{ width: `${(state.focusBurstTime / 10) * 100}%` }}
                            ></div>
                        ) : (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-full border-r border-slate-800/20 transition-all duration-300 ${i < state.comboCount ? 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-transparent'}`}
                                ></div>
                            ))
                        )}
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-wider w-16 text-right transition-colors ${state.focusBurstTime > 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-slate-500'}`}>
                        {state.focusBurstTime > 0 ? ' FOCUS MODE' : `COMBO ${state.comboCount}/5`}
                    </div>
                </div>
            </div>

            {/* Manual Click */}
            <div className={`flex flex-col items-center justify-center mb-2 relative flex-shrink transition-all duration-700 ${state.focusBurstTime > 0 ? 'scale-105 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]' : ''}`}>
                <button
                    onPointerDown={state.handleManualClick}
                    className={`relative w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 shadow-[0_0_40px_rgba(59,130,246,0.3)] border-4 border-blue-400/30 flex flex-col items-center justify-center active:scale-95 transition-transform duration-[50ms] group hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] cursor-pointer 
                        ${state.frenzyStacks >= 16 ? 'ring-2 ring-orange-400/60 shadow-[0_0_50px_rgba(251,146,60,0.4)]' : ''} 
                        ${state.enlightenments >= 1 ? 'ring-4 ring-white/40 shadow-[0_0_80px_rgba(255,255,255,0.3)] animate-[pulse_2s_ease-in-out_infinite]' : ''}`}
                >
                    <div className="text-3xl sm:text-5xl mb-1 group-hover:scale-110 transition-transform">🧠</div>
                    <div className="text-[10px] sm:text-xs font-bold text-blue-200">
                        {state.enlightenments >= 1 ? `Auto (${state.enlightenments >= 3 ? '5' : '1'}/s)` : 'Ponder'}
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:animate-ping group-hover:border-white/20"></div>
                </button>
                <div className="mt-2 text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                    +{formatNumber(state.baseClick * state.globalMultiplier * state.frenzyMultiplier * state.epiphanyMult * state.enlightenMult)} per click
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-2 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('upgrades')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'upgrades' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'}`}
                >
                    Upgrades
                </button>
                <button
                    onClick={() => setActiveTab('expeditions')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'expeditions' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'}`}
                >
                    Expeditions
                </button>
            </div>

            {/* Content Area */}
            <div className={`bg-slate-900/80 backdrop-blur border ${currentEra.borderColor} rounded-2xl p-2 flex-1 flex flex-col min-h-0`}>
                {activeTab === 'upgrades' ? (
                    <>
                        <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 px-1 tracking-wider flex-shrink-0">Upgrades & Automation</h3>
                        <div className="overflow-y-auto pr-1 space-y-2 flex-1 scrollbar-thin">
                            <UpgradeItem title="Better Focus" desc="+1 Base click power" cost={formatNumber(state.clickPowerCost)} costType="fragment" canAfford={state.fragments >= state.clickPowerCost} owned={state.clickPower - 1} onBuy={state.buyWithSave(state.buyClickPower)} icon="🎯" />

                            {GENERATORS.map((gen, idx) => {
                                // Data-driven generator loop! Check unlock condition.
                                if (gen.unlockAfter && !(state.generatorsArray[gen.unlockAfter] > 0)) {
                                    return null;
                                }
                                const cost = calcGeneratorCost(gen.baseCost, state.generatorsArray[gen.key] || 0, state.discountMult);

                                let isAutoBuying = false;
                                if (state.enlightenments >= 2) {
                                    if (state.enlightenments >= 5) {
                                        isAutoBuying = state.fragments >= cost;
                                    } else {
                                        isAutoBuying = state.fragments >= cost;
                                    }
                                }

                                return (
                                    <UpgradeItem
                                        key={gen.key}
                                        title={gen.name}
                                        desc={gen.desc}
                                        cost={formatNumber(cost)}
                                        costType="fragment"
                                        canAfford={state.fragments >= cost}
                                        owned={state.generatorsArray[gen.key] || 0}
                                        onBuy={state.buyWithSave(() => state.buyGenerator(gen.key))}
                                        icon={gen.icon}
                                        isAutoBuying={isAutoBuying}
                                    />
                                );
                            })}

                            {/* Premium Gem Upgrades */}
                            <UpgradeItem title="Insight Burst" desc={state.fragmentsPerSec > 0 ? `+${formatNumber(state.fragmentsPerSec * 120)} Fragments` : 'Need generators first'} cost={formatNumber(state.insightBurstCost)} costType="gem" canAfford={state.insightGems >= state.insightBurstCost && state.fragmentsPerSec > 0} owned={-1} onBuy={state.buyWithSave(state.buyInsightBurst)} icon="💥" isSpecial />
                            <UpgradeItem title="Aura of Learning" desc="Global 2x Multiplier" cost={formatNumber(state.multiplierCost)} costType="gem" canAfford={state.insightGems >= state.multiplierCost} owned={state.globalMultiplier - 1} onBuy={state.buyWithSave(state.buyMultiplier)} icon="✨" isSpecial />
                            <UpgradeItem title="Flashcard Synergy" desc="+1 Base Click Power" cost={formatNumber(state.synergyCost)} costType="gem" canAfford={state.insightGems >= state.synergyCost} owned={state.synergyLevel} onBuy={state.buyWithSave(state.buySynergy)} icon="⚡" isSpecial />
                            <UpgradeItem title="Discount Aura" desc="-10% Fragment Costs" cost={formatNumber(state.discountCost)} costType="gem" canAfford={state.insightGems >= state.discountCost} owned={state.discountLevel} onBuy={state.buyWithSave(state.buyDiscount)} icon="🏷️" isSpecial />
                            <UpgradeItem title="Golden Insight" desc="+5% Chance for +1 Gem/Review" cost={formatNumber(state.fortuneCost)} costType="gem" canAfford={state.insightGems >= state.fortuneCost} owned={state.fortuneLevel} onBuy={state.buyWithSave(state.buyFortune)} icon="🍀" isSpecial />

                            {/* Prestige & Enlightenment */}
                            {state.canEnlighten && (
                                <button
                                    onClick={() => setShowEnlightenConfirm(true)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-200 to-white hover:from-white hover:to-slate-100 text-slate-900 font-black text-sm transition-all active:scale-[0.98] cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-white flex items-center justify-center gap-2 mb-2 animate-[pulse_3s_ease-in-out_infinite]"
                                >
                                    <span className="text-xl">🕊️</span>
                                    <span>True Enlightenment</span>
                                </button>
                            )}

                            {state.canPrestige && (
                                <button
                                    onClick={() => setShowPrestigeConfirm(true)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-sm transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-amber-500/30 border border-amber-400/50 flex items-center justify-center gap-2"
                                >
                                    <span>💡</span>
                                    <span>Transcend — Gain Epiphany #{state.epiphanies + 1}</span>
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <ExpeditionPanel
                        activeId={state.activeExpeditionId}
                        progress={state.expeditionProgress}
                        completed={state.completedExpeditions}
                        onStart={state.handleStartExpedition}
                        era={currentEra}
                    />
                )}
            </div>
        </div>
    );
}
