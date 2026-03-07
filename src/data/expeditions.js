export const EXPEDITIONS = [
    {
        id: 'exp_rosetta',
        name: 'The Rosetta Stone',
        description: 'Decipher the ancient scripts to unlock permanent study bonuses.',
        steps: 20,
        reward: { type: 'gem_chance', value: 0.05, label: '+5% Gem Chance' },
        icon: '📜'
    },
    {
        id: 'exp_silk_road',
        name: 'The Silk Road',
        description: 'Establish trade routes to reduce the cost of future upgrades.',
        steps: 100,
        reward: { type: 'discount', value: 0.05, label: '-5% Upgrade Costs' },
        icon: '🐪'
    },
    {
        id: 'exp_apollo',
        name: 'Apollo 11',
        description: 'Reach for the stars to massively boost your manual ponder power.',
        steps: 500,
        reward: { type: 'click_power', value: 0.20, label: '+20% Click Power' },
        icon: '🚀'
    },
    {
        id: 'exp_voyager',
        name: 'Voyager 1',
        description: 'Send a message into the deep void, expanding your legacy.',
        steps: 2000,
        reward: { type: 'multiplier', value: 0.50, label: '+50% Global Multiplier' },
        icon: '🛰️'
    }
];
