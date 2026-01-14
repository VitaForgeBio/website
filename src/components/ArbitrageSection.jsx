import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/btc-battery.css';

// --- Card Component with Magnetic Effect ---
// Refactored for Stacking Context: 
// The Wrapper is static. The BG and Content animate. 
const NomadCard = ({ title, body, icon, highlightBase }) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position state
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    // Shared motion variants
    const spring = { type: 'spring', stiffness: 150, damping: 15 };

    return (
        <div
            ref={ref}
            className={`nomad-card ${isHovered ? 'hovered' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Animated Background Layer (Z: 1) */}
            <motion.div
                className="nomad-card-bg"
                animate={{
                    x: isHovered ? mousePos.x * 0.05 : 0,
                    y: isHovered ? mousePos.y * 0.05 : 0,
                }}
                transition={spring}
                style={{ borderColor: isHovered ? highlightBase : 'rgba(255,255,255,0.1)' }}
            />

            {/* Animated Content Layer (Z: 20) */}
            <motion.div
                className="nomad-content"
                animate={{
                    x: isHovered ? mousePos.x * 0.05 : 0,
                    y: isHovered ? mousePos.y * 0.05 : 0,
                }}
                transition={spring}
            >
                <div className="card-icon" style={{ borderColor: highlightBase, color: highlightBase }}>
                    {icon}
                </div>
                <h3 className="card-headline" style={{ color: highlightBase }}>{title}</h3>
                <p className="card-body">{body}</p>
            </motion.div>
        </div>
    );
};

const ArbitrageSection = () => {
    return (
        <section className="arbitrage-section">
            <div className="nomad-grid">
                <NomadCard
                    title="Sourcing Stranded Energy"
                    body="Bitcoin miners don't wait for the grid; they go to the source. They transform flared natural gas in remote fields, excess hydro in Africa, and over-provisioned solar into liquid capital. They turn 'location-locked' waste into global value."
                    highlightBase="#ffcc00"
                    icon={
                        /* Map Pin Icon (Clean) */
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    }
                />

                {/* No Pulse Line */}

                <NomadCard
                    title="Sourcing Stranded Science"
                    body="VitaForge identifies high-quality clinical candidates shelved by risk-averse developers. We 'mine' the stranded assets of the biotech industry—high-potential programs abandoned due to platform risk or capital constraints—and integrate them into our hardened treasury model."
                    highlightBase="#ff4d00"
                    icon={
                        /* Molecule Icon */
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <circle cx="20" cy="5" r="2" />
                            <circle cx="5" cy="5" r="2" />
                            <circle cx="5" cy="19" r="2" />
                            <line x1="10" y1="10" x2="6.5" y2="6.5" />
                            <line x1="14" y1="10" x2="18.5" y2="6.5" />
                            <line x1="10" y1="14" x2="6.5" y2="17.5" />
                        </svg>
                    }
                />
            </div>
        </section>
    );
};

export default ArbitrageSection;
