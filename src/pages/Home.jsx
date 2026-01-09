import React from 'react';
import logo from '../assets/VitaForge_Logo.png';
import '../styles/home.css';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <>
            <div className="hero">
                <img src={logo} alt="VitaForge Logo" className="hero-logo" />

                <h1>Biotech, De-Risked.<br />Liquidity, Unlocked.</h1>

                <p className="subtitle">
                    VitaForge is a capital-efficient NRDO fusing rigorous clinical development with a high-yield Bitcoin treasury.
                    We replace the 10-year lockup with tokenized liquidity and precision financing.
                </p>
            </div>

            <div className="content-section">
                <div className="grid-3">
                    <div className="value-card">
                        <div className="value-title">Liquid Investment</div>
                        <div className="value-text">
                            Our tokenized framework offers investors optionality to exit after early milestones,
                            eliminating the illiquidity trap of traditional biotech.
                        </div>
                    </div>
                    <div className="value-card">
                        <div className="value-title">Precision De-Risking</div>
                        <div className="value-text">
                            Fundraising is scaled strictly to critical execution steps—from GLP Tox to Phase 2—maximizing
                            capital efficiency and minimizing dilution.
                        </div>
                    </div>
                    <div className="value-card">
                        <div className="value-title">Bitcoin Treasury 2.0</div>
                        <div className="value-text">
                            We harness clinical volatility to issue convertible notes, channeling proceeds into a segregated
                            Bitcoin treasury—not biotech operations.
                        </div>
                    </div>
                </div>

                <div className="explainer-container">
                    <div className="explainer-item">
                        <div className="explainer-label">The Engine</div>
                        <div className="explainer-desc">
                            We eliminate platform risk by treating every clinical program as a standalone
                            entity with its own milestone-based fundraising. Investors fund specific assets,
                            not a diluted pipeline.
                        </div>
                    </div>
                    <div className="explainer-item">
                        <div className="explainer-label">The Fuel</div>
                        <div className="explainer-desc">
                            As the platform operator, VitaForge harnesses the volatility of these clinical
                            programs to issue convertible notes. This allows us to fund a corporate Bitcoin
                            treasury without touching the segregated clinical funds.
                        </div>
                    </div>
                    <div className="explainer-item">
                        <div className="explainer-label">The Exit</div>
                        <div className="explainer-desc">
                            Tokenization allows for asset-specific exits. Investors gain liquidity upon individual
                            successful milestones, while partners can license single, de-risked assets without
                            complex entanglements.
                        </div>
                    </div>
                </div>

                <div className="cta-container">
                    <Link to="/dashboard" className="cta-btn">View Portfolio</Link>
                </div>
            </div>
        </>
    );
}
