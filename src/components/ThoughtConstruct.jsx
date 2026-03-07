import React from 'react';

export default function ThoughtConstruct({ satiation }) {
    // Satiation is 0-15
    const isStarving = satiation <= 5;
    const isHungry = satiation > 5 && satiation < 10;
    const isSated = satiation >= 10;

    let constructColor = 'from-blue-400 to-indigo-600';
    let ringColor = 'border-blue-500/30';
    let shadowColor = 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
    let pulseAnim = 'animate-[pulse_3s_ease-in-out_infinite]';
    let face = '◡‿◡';

    if (isStarving) {
        constructColor = 'from-red-600 to-red-900';
        ringColor = 'border-red-500/40';
        shadowColor = 'shadow-[0_0_15px_rgba(220,38,38,0.5)]';
        pulseAnim = 'animate-[pulse_1s_ease-in-out_infinite]';
        face = 'x_x';
    } else if (isHungry) {
        constructColor = 'from-amber-400 to-orange-600';
        ringColor = 'border-amber-500/40';
        shadowColor = 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
        pulseAnim = 'animate-[pulse_2s_ease-in-out_infinite]';
        face = '•_•';
    } else if (isSated) {
        constructColor = 'from-emerald-400 to-teal-600';
        ringColor = 'border-emerald-400/50';
        shadowColor = 'shadow-[0_0_30px_rgba(52,211,153,0.5)]';
        pulseAnim = 'animate-bounce';
        face = '^‿^';
    }

    // 15 bars for satiation
    const bars = Array.from({ length: 15 }).map((_, i) => i < satiation);

    return (
        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800 backdrop-blur mb-2 flex-shrink-0">
            {/* The Orb */}
            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${constructColor} ${shadowColor} border-2 ${ringColor} flex items-center justify-center ${pulseAnim}`}>
                <span className="text-[10px] font-bold text-white/90 drop-shadow-md tracking-tighter">
                    {face}
                </span>

                {/* Orbiting particles if sated */}
                {isSated && (
                    <>
                        <div className="absolute inset-0 rounded-full border border-emerald-300/30 animate-[spin_4s_linear_infinite] border-t-emerald-300/80"></div>
                        <div className="absolute inset-0 rounded-full border border-teal-300/30 animate-[spin_3s_linear_infinite_reverse] border-b-teal-300/80 scale-110"></div>
                    </>
                )}
            </div>

            {/* Satiation Readout */}
            <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Memory Engram</span>
                    <span className={`text-[9px] font-bold ${isStarving ? 'text-red-400' : isHungry ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isStarving ? 'STARVING' : isHungry ? 'HUNGRY' : 'SATED'}
                    </span>
                </div>

                {/* Hunger Bar */}
                <div className="flex gap-0.5 h-1.5">
                    {bars.map((isFilled, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 rounded-sm ${isFilled ? (idx < 5 ? 'bg-red-500' : idx < 10 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-800'}`}
                        ></div>
                    ))}
                </div>
                <div className="text-[8px] text-slate-500 mt-1 flex justify-between">
                    <span>Needs Cards</span>
                    <span>Max Buffs</span>
                </div>
            </div>

            {/* Active Buffs Icon */}
            <div className="flex flex-col items-center justify-center w-8">
                {isSated ? (
                    <div className="text-emerald-400 flex flex-col items-center">
                        <span className="text-sm">✨</span>
                        <span className="text-[8px] font-bold text-center leading-tight mt-0.5">2x IDLE<br />GEMS</span>
                    </div>
                ) : isHungry ? (
                    <div className="text-slate-500 flex flex-col items-center opacity-50">
                        <span className="text-sm">💭</span>
                        <span className="text-[8px] font-bold text-center leading-tight mt-0.5">FEED<br />ME</span>
                    </div>
                ) : (
                    <div className="text-red-500 flex flex-col items-center">
                        <span className="text-sm animate-pulse">⚠️</span>
                        <span className="text-[8px] font-bold text-center leading-tight mt-0.5">STREAK<br />BREAK</span>
                    </div>
                )}
            </div>
        </div>
    );
}
