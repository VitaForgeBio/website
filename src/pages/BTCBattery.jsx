import React from 'react';
import '../styles/btc-battery.css';
import BitcoinBatteryGraphic from '../components/BitcoinBatteryGraphic';
import EnergyMiningGraphic from '../components/EnergyMiningGraphic';
import { useNavigate } from 'react-router-dom';

const BTCBattery = () => {
    const navigate = useNavigate();

    return (
        <div className="btc-battery-container">
            {/* Hero Section */}
            <section className="battery-hero">
                <h1 className="battery-title">Converting Clinical Momentum into Monetary Energy</h1>
                <p className="battery-subtitle">
                    Just as Bitcoin miners capture stranded energy and stabilize grids, VitaForge utilizes "Monetary Mining"
                    to store transient market surges as long-term capital. We call this the Bitcoin Battery.
                </p>

                {/* Graphics Container */}
                <div className="graphics-row">
                    <div className="graphic-card">
                        <h3 className="graphic-label highlight-energy">Energy Mining</h3>
                        <div className="graphic-wrapper">
                            <EnergyMiningGraphic />
                        </div>
                    </div>
                    <div className="graphic-divider"></div>
                    <div className="graphic-card">
                        <h3 className="graphic-label highlight-bio">Monetary Mining</h3>
                        <div className="graphic-wrapper">
                            <BitcoinBatteryGraphic />
                        </div>
                    </div>
                </div>
            </section>

            {/* Symmetry Section */}
            <section className="symmetry-section">
                <h2 className="section-header">The Symmetry: Energy vs. Equity</h2>
                <div className="grid-comparison">
                    <div className="grid-card">
                        <h3 className="highlight-energy">The Energy Grid</h3>
                        <p>
                            When a solar farm produces more power than the grid can handle (curtailment), that energy is wasted.
                            By Bitcoin mining, the producer converts "lost volts" into a permanent, liquid asset.
                        </p>
                    </div>
                    <div className="grid-card">
                        <h3 className="highlight-bio">The Biotech Grid</h3>
                        <p>
                            When clinical milestones or market sentiment cause a stock price to surge, that "valuation energy"
                            is often stranded or lost to future volatility. By issuing convertible notes at these peaks,
                            we "mine" the valuation and store it in Bitcoin.
                        </p>
                    </div>
                </div>
            </section>

            {/* Valley of Death Section */}
            <section className="valley-section">
                <div className="valley-content">
                    <h2>Escaping the "Valley of Death"</h2>
                    <p>
                        Biotech research is capital-intensive and subject to the "Valley of Death"—the gap between Preclinical and Phase 2.
                    </p>
                    <p>
                        Traditional treasuries (USD/Bonds) lose purchasing power over the decade-long drug development cycle.
                        The Bitcoin Battery ensures that the capital we harvest during our peaks retains—and grows—its "work capacity"
                        to fund our longest-term mtDNA and longevity research.
                    </p>
                </div>
            </section>

            {/* The Mechanism Section */}
            <section className="mechanism-section">
                <div className="mechanism-content">
                    <h2>The Mechanism: Convertible Note as a Transformer</h2>
                    <p className="mechanism-text">
                        We don't just "buy crypto." We use the convertible note as a financial transformer.
                        It allows us to capture the low cost of capital during high-valuation periods, turning "speculative promise"
                        into a "hard asset" without the immediate dilution of a standard secondary offering.
                    </p>
                </div>
            </section>

            {/* Closing Call to Action */}
            <section className="cta-section">
                <p className="cta-text">
                    We are building a company designed to outlast the typical 10-year venture cycle.
                    We are hardening our science and our treasury.
                </p>
                <button className="cta-button" onClick={() => navigate('/contact')}>
                    Request Access
                </button>
            </section>
        </div>
    );
};

export default BTCBattery;
