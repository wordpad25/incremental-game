import React, { useRef, useState, useEffect } from 'react';
import { formatNumber } from '../utils/format';
import { GENERATORS } from '../data/generators';
import { NEURAL_NODES } from '../data/nodes';

export default function NeuralMap({ fragments, ownedGenerators, onBuyGenerator }) {
    const containerRef = useRef(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // Center map on initial load
    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTransform({
                x: rect.width / 2 - 250, // Center based on the Synapse node x:250
                y: rect.height / 2 - 150,
                scale: 0.8 // slight zoom out to see more
            });
        }
    }, []);

    const handlePointerDown = (e) => {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e) => {
        isDragging.current = false;
        e.target.releasePointerCapture(e.pointerId);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        setTransform(prev => {
            const newScale = Math.min(Math.max(prev.scale - e.deltaY * zoomSensitivity, 0.3), 3);
            return { ...prev, scale: newScale };
        });
    };

    // Helper to check if a node is unlocked
    const isNodeUnlocked = (node) => {
        if (!node.required || node.required.length === 0) return true;
        // Node is unlocked if player owns at least 1 of EVERY required generator
        return node.required.every(reqId => {
            const reqKey = reqId.replace('gen_', '').toLowerCase();
            const requiredGen = GENERATORS.find(g => g.key.toLowerCase() === reqKey);
            if (!requiredGen) return false;
            return (ownedGenerators[requiredGen.key] || 0) > 0;
        });
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-slate-950 rounded-2xl border border-slate-700/50 overflow-hidden relative cursor-grab active:cursor-grabbing shadow-inner"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                transform: `scale(${transform.scale}) translate(${transform.x / transform.scale}px, ${transform.y / transform.scale}px)`,
                transformOrigin: '0 0'
            }} />

            <div
                className="absolute origin-top-left transition-transform duration-75 ease-out"
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
            >
                {/* Draw SVG connections first so they render under nodes */}
                <svg className="absolute overflow-visible" style={{ width: 1000, height: 1000, left: 0, top: 0, pointerEvents: 'none' }}>
                    {NEURAL_NODES.map(node => {
                        return node.required.map(reqId => {
                            const reqNode = NEURAL_NODES.find(n => n.id === reqId);
                            if (!reqNode) return null;
                            const isUnlocked = isNodeUnlocked(node);

                            // Adjusting coordinates to center the line on the node (assuming 80x80 nodes)
                            return (
                                <path
                                    key={`${reqId}-${node.id}`}
                                    d={`M ${reqNode.x + 40} ${reqNode.y + 40} L ${node.x + 40} ${node.y + 40}`}
                                    stroke={isUnlocked ? 'rgba(56, 189, 248, 0.4)' : 'rgba(71, 85, 105, 0.4)'}
                                    strokeWidth="3"
                                    fill="none"
                                />
                            );
                        });
                    })}
                </svg>

                {/* Render Nodes */}
                {NEURAL_NODES.map(node => {
                    // Match gen_name format back to the GENERATORS key
                    const genKey = node.id.replace('gen_', '').toLowerCase();
                    const generator = GENERATORS.find(g => g.key.toLowerCase() === genKey);

                    if (!generator) return null;

                    const owned = ownedGenerators[generator.key] || 0;
                    const cost = Math.floor(generator.baseCost * Math.pow(generator.costMultiplier, owned));
                    const canAfford = fragments >= cost;
                    const unlocked = isNodeUnlocked(node);

                    if (!unlocked && owned === 0) {
                        // Hidden/Silhouetted node
                        return (
                            <div
                                key={node.id}
                                className="absolute w-[80px] h-[80px] bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 opacity-50"
                                style={{ left: node.x + 40, top: node.y + 40 }}
                            >
                                <span className="text-xl">❓</span>
                            </div>
                        )
                    }

                    return (
                        <div
                            key={node.id}
                            className={`absolute w-[80px] h-[80px] rounded-full border-2 flex flex-col items-center justify-center cursor-pointer shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-105 active:scale-95 ${canAfford ? 'bg-slate-900 border-sky-500 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'bg-slate-900 border-slate-600'}`}
                            style={{ left: node.x + 40, top: node.y + 40 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (canAfford) onBuyGenerator(generator.key);
                            }}
                        >
                            <div className="text-2xl mb-1">{generator.icon}</div>
                            {owned > 0 && (
                                <div className="absolute -top-2 -right-2 bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                                    {owned}
                                </div>
                            )}
                            <div className="text-[10px] font-bold text-slate-300 pointer-events-none">{formatNumber(cost)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
