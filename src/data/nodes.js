export const NEURAL_NODES = [
    // Core Node
    { id: 'gen_synapse', type: 'generator', label: 'Synapse', x: 250, y: 300, required: [] },

    // Tier 1 Branching
    { id: 'gen_neuron', type: 'generator', label: 'Neuron', x: 150, y: 200, required: ['gen_synapse'] },
    { id: 'gen_dendrite', type: 'generator', label: 'Dendrite', x: 350, y: 200, required: ['gen_synapse'] },

    // Tier 2
    { id: 'gen_lobe', type: 'generator', label: 'Lobe', x: 100, y: 80, required: ['gen_neuron'] },
    { id: 'gen_hemisphere', type: 'generator', label: 'Hemisphere', x: 400, y: 80, required: ['gen_dendrite'] },

    // Tier 3
    { id: 'gen_cortex', type: 'generator', label: 'Cortex', x: 250, y: 0, required: ['gen_lobe', 'gen_hemisphere'] },
    { id: 'gen_brain', type: 'generator', label: 'Brain', x: 250, y: -100, required: ['gen_cortex'] },

    // Prestige Node (High up)
    { id: 'gen_singularity', type: 'generator', label: 'Singularity', x: 250, y: -250, required: ['gen_brain'] }
];
