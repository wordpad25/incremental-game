export const NEURAL_NODES = [
    // Core Node
    { id: 'gen_interns', type: 'generator', label: 'Interns', x: 250, y: 300, required: [] },

    // Tier 1 Branching
    { id: 'gen_researchers', type: 'generator', label: 'Researchers', x: 250, y: 200, required: ['gen_interns'] },

    // Tier 2
    { id: 'gen_datacenters', type: 'generator', label: 'Datacenters', x: 150, y: 100, required: ['gen_researchers'] },
    { id: 'gen_quantumAI', type: 'generator', label: 'Quantum AI', x: 350, y: 100, required: ['gen_researchers'] },

    // Support Nodes for Tier 2
    { id: 'sup_coolingSystems', type: 'support', label: 'Cooling Systems', x: 50, y: 100, required: ['gen_datacenters'] },
    { id: 'sup_ethicsProtocol', type: 'support', label: 'Ethics Protocol', x: 450, y: 100, required: ['gen_quantumAI'] },

    // Tier 3
    { id: 'gen_neuralClusters', type: 'generator', label: 'Neural Clusters', x: 150, y: -50, required: ['gen_datacenters'] },
    { id: 'gen_cosmicEngines', type: 'generator', label: 'Cosmic Engines', x: 350, y: -50, required: ['gen_quantumAI'] },

    // Prestige Node (High up)
    { id: 'gen_singularities', type: 'generator', label: 'Singularity', x: 250, y: -200, required: ['gen_neuralClusters', 'gen_cosmicEngines'] }
];
