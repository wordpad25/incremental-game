export const CONSUMABLES = {
    'streak_shield': {
        id: 'streak_shield',
        name: 'Streak Shield',
        desc: 'Protects the construct from decaying for 24 hours.',
        icon: '🛡️',
        cost: 50,
        costType: 'core',
        duration: 24 * 60 * 60 * 1000 // 24 hours
    },
    'fragment_surge': {
        id: 'fragment_surge',
        name: 'Fragment Surge',
        desc: '10x production for 5 minutes.',
        icon: '🌊',
        cost: 20,
        costType: 'spark',
        duration: 5 * 60 * 1000 // 5 minutes
    }
};
