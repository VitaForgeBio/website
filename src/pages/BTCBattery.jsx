import React from 'react';
import '../styles/btc-battery.css';
import BitcoinBatteryGraphic from '../components/BitcoinBatteryGraphic';
import EnergyMiningGraphic from '../components/EnergyMiningGraphic';
import ArbitrageSection from '../components/ArbitrageSection';
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

            {/* Arbitrage Section */}
            <ArbitrageSection />

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
