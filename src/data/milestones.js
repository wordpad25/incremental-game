// ─── Milestone Definitions ──────────────────────────────────
// Each milestone has an id, display info, a condition function, and reward.
export const MILESTONES = [
    // SRS / Cards Reviewed
    { id: 'rev_10', name: 'Curious Mind', icon: '📖', condition: (s) => s.totalCardsReviewed >= 10, rewardType: 'fragments', rewardAmount: 50 },
    { id: 'rev_50', name: 'Dedicated Student', icon: '🎓', condition: (s) => s.totalCardsReviewed >= 50, rewardType: 'gems', rewardAmount: 5 },
    { id: 'rev_100', name: 'Century Scholar', icon: '📚', condition: (s) => s.totalCardsReviewed >= 100, rewardType: 'gems', rewardAmount: 10 },
    { id: 'rev_500', name: 'Knowledge Seeker', icon: '🔍', condition: (s) => s.totalCardsReviewed >= 500, rewardType: 'gems', rewardAmount: 50 },
    { id: 'rev_1000', name: 'Grand Scholar', icon: '🏛️', condition: (s) => s.totalCardsReviewed >= 1000, rewardType: 'gems', rewardAmount: 100 },

    // Fragments earned
    { id: 'frag_10k', name: 'Fragment Hoarder', icon: '🧩', condition: (s) => s.totalFragmentsEarned >= 10000, rewardType: 'fragments', rewardAmount: 500 },
    { id: 'frag_1m', name: 'Fragment Millionaire', icon: '💰', condition: (s) => s.totalFragmentsEarned >= 1000000, rewardType: 'gems', rewardAmount: 5 },
    { id: 'frag_1b', name: 'Fragment Billionaire', icon: '👑', condition: (s) => s.totalFragmentsEarned >= 1000000000, rewardType: 'gems', rewardAmount: 25 },

    // Clicks
    { id: 'click_100', name: 'Persistent Ponderer', icon: '🖱️', condition: (s) => s.totalClicks >= 100, rewardType: 'fragments', rewardAmount: 100 },
    { id: 'click_1000', name: 'Click Champion', icon: '⚡', condition: (s) => s.totalClicks >= 1000, rewardType: 'gems', rewardAmount: 3 },

    // Frenzy
    { id: 'frenzy_5', name: 'Warming Up', icon: '🌡️', condition: (s) => s.frenzyStacks >= 5, rewardType: 'fragments', rewardAmount: 100 },
    { id: 'frenzy_15', name: 'On Fire', icon: '🔥', condition: (s) => s.frenzyStacks >= 15, rewardType: 'gems', rewardAmount: 3 },
    { id: 'frenzy_20', name: 'Maximum Frenzy', icon: '💥', condition: (s) => s.frenzyStacks >= 20, rewardType: 'gems', rewardAmount: 10 },

    // Prestige
    { id: 'prestige_1', name: 'First Epiphany', icon: '💡', condition: (s) => s.totalResets >= 1, rewardType: 'gems', rewardAmount: 10 },
    { id: 'prestige_5', name: 'Transcendent', icon: '✨', condition: (s) => s.totalResets >= 5, rewardType: 'gems', rewardAmount: 50 },

    // Gems
    { id: 'gem_100', name: 'Gem Collector', icon: '💎', condition: (s) => s.totalGemsEarned >= 100, rewardType: 'gems', rewardAmount: 5 },

    // Generators
    { id: 'gen_singularity', name: 'Singularity Achieved', icon: '♾️', condition: (s) => s.singularities >= 1, rewardType: 'gems', rewardAmount: 25 },
];
