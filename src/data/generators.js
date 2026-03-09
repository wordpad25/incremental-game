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

export const SUPPORT_NODES = [
    { key: 'coolingSystems', parentKey: 'datacenters', name: 'Cooling Systems', icon: '❄️', desc: 'Datacenters production x2', baseCost: 50000, multiplier: 2 },
    { key: 'ethicsProtocol', parentKey: 'quantumAI', name: 'Ethics Protocol', icon: '⚖️', desc: 'Quantum AI production x2', baseCost: 500000, multiplier: 2 },
];

export const COST_GROWTH = 1.15;
export const SOFT_CAP_THRESHOLD = 25;
export const SOFT_CAP_GROWTH = 1.50;

export function calcGeneratorCost(baseCost, owned, discountMult) {
    if (owned < SOFT_CAP_THRESHOLD) {
        return Math.floor(baseCost * Math.pow(COST_GROWTH, owned) * discountMult);
    } else {
        // Apply soft cap growth for levels above the threshold
        const baseAtCap = baseCost * Math.pow(COST_GROWTH, SOFT_CAP_THRESHOLD);
        return Math.floor(baseAtCap * Math.pow(SOFT_CAP_GROWTH, owned - SOFT_CAP_THRESHOLD) * discountMult);
    }
}

export function calcTotalProduction(generators, supportNodes = {}) {
    let total = 0;
    for (const gen of GENERATORS) {
        let genProd = (generators[gen.key] || 0) * gen.production;

        // Apply support node multipliers
        for (const support of SUPPORT_NODES) {
            if (support.parentKey === gen.key && supportNodes[support.key]) {
                genProd *= support.multiplier;
            }
        }

        total += genProd;
    }
    return total;
}
