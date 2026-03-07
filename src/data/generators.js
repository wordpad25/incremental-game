// ─── Generator Definitions ──────────────────────────────────
// Each generator has a key (matching state), display info, and production rate.
// baseCost × 1.15^owned × discountMult = actual cost

export const GENERATORS = [
    { key: 'interns', name: 'Hire Intern', icon: '👨‍🎓', desc: '+1 Fragment/sec', baseCost: 10, production: 1, unlockAfter: null },
    { key: 'researchers', name: 'Hire Researcher', icon: '🔬', desc: '+10 Fragments/sec', baseCost: 100, production: 10, unlockAfter: null },
    { key: 'datacenters', name: 'Datacenter', icon: '🖥️', desc: '+100 Fragments/sec', baseCost: 1000, production: 100, unlockAfter: null },
    { key: 'quantumAI', name: 'Quantum AI', icon: '🤖', desc: '+1K Fragments/sec', baseCost: 10000, production: 1000, unlockAfter: null },
    { key: 'neuralClusters', name: 'Neural Cluster', icon: '🧬', desc: '+10K Fragments/sec', baseCost: 100000, production: 10000, unlockAfter: 'quantumAI' },
    { key: 'cosmicEngines', name: 'Cosmic Engine', icon: '🌌', desc: '+100K Fragments/sec', baseCost: 1000000, production: 100000, unlockAfter: 'neuralClusters' },
    { key: 'singularities', name: 'Singularity', icon: '♾️', desc: '+1M Fragments/sec', baseCost: 10000000, production: 1000000, unlockAfter: 'cosmicEngines' },
];

export const COST_GROWTH = 1.15;

export function calcGeneratorCost(baseCost, owned, discountMult) {
    return Math.floor(baseCost * Math.pow(COST_GROWTH, owned) * discountMult);
}

export function calcTotalProduction(generators) {
    let total = 0;
    for (const gen of GENERATORS) {
        total += (generators[gen.key] || 0) * gen.production;
    }
    return total;
}
