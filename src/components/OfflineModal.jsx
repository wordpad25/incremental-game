import { formatNumber, formatDuration } from '../utils/format';

export default function OfflineModal({ offlineReport, onDismiss }) {
    if (!offlineReport) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 max-w-xs w-full mx-4 shadow-[0_0_40px_rgba(99,102,241,0.2)] text-center">
                <div className="text-4xl mb-3">🌟</div>
                <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-1">Welcome Back!</h2>
                <p className="text-xs text-slate-400 mb-4">
                    You were away for <span className="text-slate-200 font-bold">{formatDuration(offlineReport.seconds)}</span>
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-5">
                    <div className="text-2xl font-black text-blue-400 font-mono">+{formatNumber(offlineReport.fragments)}</div>
                    <div className="text-[10px] uppercase font-bold text-blue-300/70 mt-1">🧩 Fragments Collected</div>
                </div>
                <button onClick={onDismiss} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20">
                    Collect & Continue
                </button>
            </div>
        </div>
    );
}
