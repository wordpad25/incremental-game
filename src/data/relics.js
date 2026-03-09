export const RELICS = {
    'relic_rosetta': {
        id: 'relic_rosetta',
        name: 'The Rosetta Stone',
        desc: '+5% to base Insight Gem drop chance.',
        icon: '🗿',
        baseEffect: 0.05,
        scaling: 0.05
    },
    'relic_voyager': {
        id: 'relic_voyager',
        name: 'Voyager Disk',
        desc: '+50% Global Fragment Generation Multiplier.',
        icon: '💿',
        baseEffect: 0.5,
        scaling: 0.25
    },
    'relic_hourglass': {
        id: 'relic_hourglass',
        name: 'Hourglass of Focus',
        desc: '+20% Auto-Clicker speed (Enlightenment bonus).',
        icon: '⏳',
        baseEffect: 0.2,
        scaling: 0.1
    },
    'relic_prism': {
        id: 'relic_prism',
        name: 'Prism of Clarity',
        desc: 'Frenzy decays 50% slower.',
        icon: '💎',
        baseEffect: 0.5, // 0.5 means 50% slower (multiplier 0.5 on decay?)
        scaling: 0.1
    }
};

export function getRelicEffect(relicId, level = 1) {
    const relic = RELICS[relicId];
    if (!relic) return 0;
    return relic.baseEffect + (relic.scaling * (level - 1));
}
