import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/thesis.css';

const Thesis = () => {
    return (
        <div className="thesis-page">
            {/* Hero Section */}
            <section className="thesis-hero">
                <div className="hero-bg-gradient" />
                <h1 className="thesis-h1">
                    Unbundling the <span className="highlight-primary">Biotech Capital Structure</span>.
                </h1>
                <p className="thesis-subhead">
                    Why the future of life science funding is about <br /> investing in <span className="highlight-accent">Rows</span>, not <span className="highlight-traditional">Columns</span>.
                </p>
            </section>

            {/* Core Concept Comparison */}
            <section className="models-comparison">
                <div className="comparison-grid">

                    {/* Left Side: Traditional VC (Columns) */}
                    <div className="model-card traditional">
                        <div className="model-header">
                            <h2 className="model-title">The Column Model</h2>
                            <p className="model-description">
                                Investors buy the whole vertical stack. You are exposed to management risk, platform risk, and binary outcomes across a decade.
                                <br />
                                <span className="capital-badge">Locked Capital</span>
                            </p>
                        </div>

                        {/* Visual: Stack of Blocks */}
                        <div className="stack-visual">
                            <div className="block locked">Team / Management</div>
                            <div className="block locked">IP / Platform</div>
                            <div className="block locked">Pre-clinical</div>
                            <div className="block locked">Phase 1</div>
                            <div className="block locked">Phase 2</div>

                            {/* Overlay */}
                            <div className="diagonal-overlay">
                                10 YEAR HOLD
                            </div>
                        </div>
                    </div>

                    {/* Right Side: VitaForge (Rows) */}
                    <div className="model-card vitaforge">
                        <div className="model-header">
                            <h2 className="model-title">The Row Model</h2>
                            <p className="model-description">
                                Liquid markets allow investors to fund specific milestones. Capital enters to de-risk a specific step and with optionality to exit upon data release.
                                <br />
                                <span className="capital-badge">Liquid Capital</span>
                            </p>
                        </div>

                        {/* Visual: Stack of Blocks */}
                        <div className="stack-visual">
                            <div className="block liquid">Team / Management</div>
                            <div className="block liquid">IP / Platform</div>
                            <div className="block liquid">Pre-clinical</div>
                            <div className="block liquid glow">Phase 1</div>
                            <div className="block liquid">Phase 2</div>
                        </div>
                    </div>

                    {/* New Section: De-risking Strategies */}
                    {/* Left Side: De-risking Columns (Venture) */}
                    <div className="model-card traditional">
                        <div className="model-header">
                            <h2 className="model-title">De-risking Columns</h2>
                            <p className="model-description">
                                Diversification by Entity. You are still exposed to specific management execution and binary failure risks per asset.
                                <br />
                                <span className="capital-badge">Venture Funds</span>
                            </p>
                        </div>

                        {/* Visual: De-risking Grid */}
                        <div className="derisking-wrapper">
                            {/* Headers */}
                            <div className="derisking-header-row">
                                <span className="header-label">Biotech A</span>
                                <span className="header-label">Biotech B</span>
                                <span className="header-label">Biotech C</span>
                                <span className="header-label">Biotech D</span>
                                <span className="header-label">Biotech E</span>
                            </div>

                            <div className="derisking-body">
                                {/* Stage Labels */}
                                <div className="stage-labels-col">
                                    <span className="stage-label">Team / Mgt</span>
                                    <span className="stage-label">IP / Plat</span>
                                    <span className="stage-label">Pre-clin</span>
                                    <span className="stage-label">Phase 1</span>
                                    <span className="stage-label">Phase 2</span>
                                </div>

                                {/* Columns */}
                                <div className="columns-container">
                                    {/* Col 1: Full Success */}
                                    <div className="small-col full">
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                    </div>
                                    {/* Col 2: Fail at Pre-clinical */}
                                    <div className="small-col">
                                        <div className="small-block"></div>
                                        <div className="small-block placeholder"></div>
                                        <div className="small-block placeholder"></div>
                                        <div className="small-block placeholder"></div>
                                        <div className="small-block placeholder"></div>
                                    </div>
                                    {/* Col 3: Fail at Phase 2 */}
                                    <div className="small-col">
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block placeholder"></div>
                                        <div className="small-block placeholder"></div>
                                    </div>
                                    {/* Col 4: Full Success */}
                                    <div className="small-col full">
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                    </div>
                                    {/* Col 5: Fail (2 blocks) */}
                                    <div className="small-col">
                                        <div className="small-block"></div>
                                        <div className="small-block"></div>
                                        <div className="small-block placeholder"></div>
                                        <div className="small-block placeholder"></div>
                                        <div className="small-block placeholder"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: De-risking Rows (Precision) */}
                    <div className="model-card vitaforge">
                        <div className="model-header">
                            <h2 className="model-title">De-risking Rows</h2>
                            <p className="model-description">
                                Diversification by Milestone. Exposure to a high-volume cadre of assets at the exact moment of value inflection.
                                <br />
                                <span className="capital-badge">Precision Funds</span>
                            </p>
                        </div>

                        {/* Visual: De-risking Grid */}
                        <div className="derisking-wrapper">
                            {/* Headers */}
                            <div className="derisking-header-row">
                                <span className="header-label">Asset A</span>
                                <span className="header-label">Asset B</span>
                                <span className="header-label">Asset C</span>
                                <span className="header-label">Asset D</span>
                                <span className="header-label">Asset E</span>
                            </div>

                            <div className="derisking-body">
                                {/* Stage Labels */}
                                <div className="stage-labels-col">
                                    <span className="stage-label">Team / Mgt</span>
                                    <span className="stage-label">IP / Plat</span>
                                    <span className="stage-label">Pre-clin</span>
                                    <span className="stage-label">Phase 1</span>
                                    <span className="stage-label">Phase 2</span>
                                </div>

                                {/* Columns */}
                                <div className="columns-container">
                                    {[1, 2, 3, 4, 5].map((col) => (
                                        <div key={col} className="small-col ghost-stack">
                                            <div className="small-block ghost"></div>
                                            <div className="small-block ghost"></div>
                                            <div className="small-block ghost"></div>
                                            <div className="small-block highlight"></div> {/* Phase 1 Step */}
                                            <div className="small-block ghost"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Economic Argument */}
            <section className="economic-argument">
                <div className="argument-container">
                    <span className="alpha-badge">The Alpha</span>
                    <h2 className="argument-h2">
                        Arbitraging the <span className="underline-style">Valley of Death</span>.
                    </h2>
                    <p className="argument-text">
                        The bottleneck for funding is currently at critical early studies (GLP Tox & Phase 1).
                        By tokenizing this specific "Row," we capture the steepest value step-up in the asset's lifecycle
                        without taking on the 10-year holding period of a traditional fund.
                    </p>
                </div>
            </section>

            {/* Call to Action */}
            <div className="thesis-cta">
                <div className="cta-buttons">
                    <a href="#" className="btn-primary">Read the Whitepaper</a>
                    <Link to="/contact" className="btn-secondary">Contact Relations</Link>
                </div>
            </div>
        </div >
    );
};

export default Thesis;
