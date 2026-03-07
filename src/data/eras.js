export const ERAS = [
    {
        id: 1,
        name: 'Neolithic',
        fpsThreshold: 0,
        studyReq: 0,
        themeClass: 'era-neolithic',
        bgGradient: 'from-[#1a140f] to-[#2d2417]',
        accentColor: 'text-amber-600',
        borderColor: 'border-amber-700/40',
        icon: '🗿'
    },
    {
        id: 2,
        name: 'Industrial',
        fpsThreshold: 100,
        studyReq: 25,
        themeClass: 'era-industrial',
        bgGradient: 'from-[#1a1a1c] to-[#2d2d30]',
        accentColor: 'text-orange-400',
        borderColor: 'border-orange-900/40',
        icon: '⚙️'
    },
    {
        id: 3,
        name: 'Atomic',
        fpsThreshold: 10000,
        studyReq: 100,
        themeClass: 'era-atomic',
        bgGradient: 'from-[#0f1a0f] to-[#1a2d1a]',
        accentColor: 'text-emerald-500',
        borderColor: 'border-emerald-900/40',
        icon: '⚛️'
    },
    {
        id: 4,
        name: 'Digital',
        fpsThreshold: 1000000,
        studyReq: 500,
        themeClass: 'era-digital',
        bgGradient: 'from-[#0f141a] to-[#172535]',
        accentColor: 'text-blue-400',
        borderColor: 'border-blue-900/40',
        icon: '💻'
    },
    {
        id: 5,
        name: 'Galactic',
        fpsThreshold: 1000000000,
        studyReq: 1000,
        themeClass: 'era-galactic',
        bgGradient: 'from-[#140f1a] to-[#251735]',
        accentColor: 'text-fuchsia-500',
        borderColor: 'border-fuchsia-900/40',
        icon: '🌌'
    }
];

export function getNextEra(currentEraId, fragmentsPerSec, totalCardsReviewed) {
    const nextEra = ERAS.find(e => e.id === currentEraId + 1);
    if (!nextEra) return null;

    if (fragmentsPerSec >= nextEra.fpsThreshold && totalCardsReviewed >= nextEra.studyReq) {
        return nextEra;
    }
    return null;
}
