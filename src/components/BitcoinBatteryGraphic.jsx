import React, { useEffect, useState } from 'react';

const BitcoinBatteryGraphic = () => {
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

    // Derived values for animations
    const chartWidth = 300;
    const chartHeight = 150;

    // Create a path that looks like a stock chart surging
    const points = [
        [0, 140], [30, 130], [50, 135], [80, 110], [100, 115],
        [130, 90], [150, 95], [180, 60], [210, 65], [240, 30], [270, 35], [300, 10]
    ];

    const chartPath = `M ${points.map(p => p.join(',')).join(' L ')}`;

    // Calculate the length of the chart path for dasharray animation (approximate)
    // or just use a masking rect. Let's use a mask.
    const maskWidth = (progress / 100) * chartWidth;

    return (
        <svg width="600" height="300" viewBox="0 0 600 300" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d00" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* --- Left Side: Biotech Stock Chart --- */}
            <g transform="translate(50, 75)">
                <text x="150" y="-30" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">VALUATION SURGE</text>

                {/* Axes */}
                <line x1="0" y1="150" x2="300" y2="150" stroke="#555" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="150" stroke="#555" strokeWidth="2" />

                {/* The Chart Line */}
                <path d={chartPath} fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />

                {/* Animated Chart Line */}
                <clipPath id="chartMask">
                    <rect x="0" y="0" width={maskWidth} height="150" />
                </clipPath>

                <g clipPath="url(#chartMask)">
                    <path d={chartPath} fill="none" stroke="#ff4d00" strokeWidth="3" filter="url(#glow)" />
                    <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="4" fill="#ff4d00" />
                </g>
            </g>

            {/* --- Arrow Connection --- */}
            <g transform="translate(370, 150)">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#00f0ff" />
                    </marker>
                </defs>
                <line x1="0" y1="0" x2="60" y2="0" stroke="#00f0ff" strokeWidth="2" markerEnd="url(#arrowhead)" opacity={progress > 20 ? 1 : 0.3} />
                <text x="30" y="-10" fill="#00f0ff" textAnchor="middle" fontSize="10">CONVERTIBLE\nNOTE</text>
            </g>

            {/* --- Right Side: Bitcoin Battery --- */}
            <g transform="translate(460, 50)">
                <text x="50" y="-5" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">BITCOIN BATTERY</text>

                {/* Battery Body */}
                <rect x="0" y="20" width="100" height="180" rx="10" stroke="#fff" strokeWidth="3" fill="rgba(0,0,0,0.5)" />
                {/* Battery Positive Terminal */}
                <rect x="35" y="10" width="30" height="10" fill="#fff" />

                {/* Fill Level */}
                {/* We map progress 0-100 to height 0-170 (leaving some padding) */}
                <rect
                    x="5"
                    y={20 + 175 - (progress / 100 * 170)}
                    width="90"
                    height={Math.max(0, (progress / 100 * 170))}
                    rx="5"
                    fill="#ffcc00"
                    filter="url(#glow)"
                />

                {/* Bitcoin Symbol on top of battery */}
                <circle cx="50" cy="110" r="30" fill="rgba(0,0,0,0.3)" />
                <text x="50" y="122" fill="#fff" textAnchor="middle" fontSize="36" fontWeight="bold">₿</text>
            </g>

        </svg>
    );
};

export default BitcoinBatteryGraphic;
