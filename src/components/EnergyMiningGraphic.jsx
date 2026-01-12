import React, { useEffect, useState } from 'react';

const EnergyMiningGraphic = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <svg width="600" height="300" viewBox="0 0 600 300" style={{ overflow: 'visible' }}>
            <defs>
                {/* Reusing gradients/filters if possible, or redefining local ones */}
                <filter id="glow-energy">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <marker id="arrowhead-energy" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ffcc00" />
                </marker>
            </defs>

            {/* --- Left Side: Energy Producer (Solar/Grid) --- */}
            <g transform="translate(50, 75)">
                <text x="100" y="-30" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">ENERGY SURPLUS</text>

                {/* Sun Icon */}
                <circle cx="100" cy="75" r="40" fill="none" stroke="#ffcc00" strokeWidth="3" filter="url(#glow-energy)" />
                <circle cx="100" cy="75" r="20" fill="#ffcc00" filter="url(#glow-energy)" opacity="0.8" />

                {/* Rays */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <line
                        key={i}
                        x1="100" y1="75"
                        x2={100 + Math.cos(angle * Math.PI / 180) * 60}
                        y2={75 + Math.sin(angle * Math.PI / 180) * 60}
                        stroke="#ffcc00"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity={progress % 20 > 10 ? 1 : 0.5} // Blinking effect
                    />
                ))}
            </g>

            {/* --- Arrow Connection: Miner --- */}
            <g transform="translate(250, 150)">
                {/* The Miner Box */}
                <rect x="-30" y="-30" width="60" height="60" fill="rgba(20,20,30,0.8)" stroke="#ffcc00" strokeWidth="2" />
                {/* Fan blades or lights */}
                <circle cx="0" cy="0" r="20" stroke="#555" strokeWidth="1" fill="none" />
                <line x1="-20" y1="0" x2="20" y2="0" stroke="#555" transform={`rotate(${progress * 10})`} />
                <line x1="0" y1="-20" x2="0" y2="20" stroke="#555" transform={`rotate(${progress * 10})`} />

                <text x="0" y="45" fill="#ffcc00" textAnchor="middle" fontSize="10">ASIC MINER</text>
            </g>

            {/* Connection Lines */}
            <line x1="150" y1="150" x2="220" y2="150" stroke="#ffcc00" strokeWidth="2" markerEnd="url(#arrowhead-energy)" strokeDasharray="5,3" />
            <line x1="280" y1="150" x2="430" y2="150" stroke="#ffcc00" strokeWidth="2" markerEnd="url(#arrowhead-energy)" opacity={progress > 20 ? 1 : 0.3} />


            {/* --- Right Side: Bitcoin Battery --- */}
            <g transform="translate(460, 50)">
                <text x="50" y="-5" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">BITCOIN BATTERY</text>

                {/* Battery Body */}
                <rect x="0" y="20" width="100" height="180" rx="10" stroke="#fff" strokeWidth="3" fill="rgba(0,0,0,0.5)" />
                {/* Battery Positive Terminal */}
                <rect x="35" y="10" width="30" height="10" fill="#fff" />

                {/* Fill Level */}
                <rect
                    x="5"
                    y={20 + 175 - (progress / 100 * 170)}
                    width="90"
                    height={Math.max(0, (progress / 100 * 170))}
                    rx="5"
                    fill="#ffcc00"
                    filter="url(#glow-energy)"
                />

                {/* Bitcoin Symbol */}
                <circle cx="50" cy="110" r="30" fill="rgba(0,0,0,0.3)" />
                <text x="50" y="122" fill="#fff" textAnchor="middle" fontSize="36" fontWeight="bold">₿</text>
            </g>

        </svg>
    );
};

export default EnergyMiningGraphic;
