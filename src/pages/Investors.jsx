import React, { useState } from 'react';
import '../styles/investors.css';

export default function Investors() {
    const [interest, setInterest] = useState('biotech');

    const handleSubmit = (e) => {
        e.preventDefault();
        let targetEmail = "";
        if (interest === 'biotech') {
            targetEmail = "assets@vitaforge.bio";
            alert("Routing to Asset Management Team: " + targetEmail);
        } else if (interest === 'treasury') {
            targetEmail = "treasury@vitaforge.bio";
            alert("Routing to Treasury Operations Team: " + targetEmail);
        } else {
            targetEmail = "info@vitaforge.bio";
            alert("Routing to General Inquiries: " + targetEmail);
        }
        console.log(`Form submitted to ${targetEmail}`);
    };

    return (
        <>
            <header className="page-header">
                <h1>Two Engines. One Ecosystem.</h1>
                <p className="subtitle">Select your investment strategy.</p>
            </header>

            <div className="split-container">
                <div className="investor-column">
                    <div className="col-title">The Asset Investor</div>
                    <span className="col-audience">For Biotech Investors & Token Holders</span>

                    <div className="point-item">
                        <div className="point-title">Liquidity, Not Lockups</div>
                        <div className="point-desc">
                            Traditional biotech VC traps capital for 10+ years. Our tokenized asset framework creates a liquid
                            secondary market, giving you optionality to exit after early milestones like GLP Tox or Phase 1.
                        </div>
                    </div>
                    <div className="point-item">
                        <div className="point-title">Precision De-Risking</div>
                        <div className="point-desc">
                            We minimize platform risk through <strong>Asset-Specific Isolation</strong>. You invest in specific
                            clinical programs funded strictly to their next critical execution step. If an asset fails, it fails
                            alone.
                        </div>
                    </div>
                    <div className="point-item">
                        <div className="point-title">High-Return Potential</div>
                        <div className="point-desc">
                            Gain early-stage access to high-alpha assets (NRDO model) with the structural protections and
                            liquidity usually reserved for public markets.
                        </div>
                    </div>
                </div>

                <div className="investor-column">
                    <div className="col-title">The Treasury Investor</div>
                    <span className="col-audience">For Convertible Note Holders & Macro Investors</span>

                    <div className="point-item">
                        <div className="point-title">Uncorrelated Volatility Engine</div>
                        <div className="point-desc">
                            We harness <strong>Bitcoin-independent volatility</strong>—clinical trial outcomes—to drive
                            financing. This allows us to execute leveraged Bitcoin purchases regardless of Bitcoin’s current
                            price momentum.
                        </div>
                    </div>
                    <div className="point-item">
                        <div className="point-title">High-Alpha Treasury Growth</div>
                        <div className="point-desc">
                            By leveraging the "high beta" nature of early-stage biotech to secure favorable financing terms, we
                            turn clinical progress into a mechanism for aggressive, low-cost Bitcoin acquisition.
                        </div>
                    </div>
                    <div className="point-item">
                        <div className="point-title">Compartmentalized Security</div>
                        <div className="point-desc">
                            Clinical development is funded by asset-specific raises; the treasury is funded by convertible note
                            operations. Your Bitcoin exposure is protected from biotech burn rates.
                        </div>
                    </div>
                </div>
            </div>

            <div className="summary-section">
                <div className="summary-text">
                    "VitaForge separates the <strong>burn</strong> from the <strong>earn</strong>.
                    Biotech Investors get pure exposure to scientific breakthroughs without platform dilution,
                    while Treasury Investors get a Bitcoin accumulation strategy powered by an uncorrelated volatility engine."
                </div>
            </div>

            <div className="form-section">
                <div className="form-card">
                    <h2 style={{ color: 'white', marginTop: 0, textAlign: 'center' }}>Request Access</h2>
                    <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '2rem' }}>
                        Select your area of interest to reach the appropriate team.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>I am interested in</label>
                            <select value={interest} onChange={(e) => setInterest(e.target.value)}>
                                <option value="biotech">Biotech Asset Opportunities (Tokenized)</option>
                                <option value="treasury">Bitcoin Treasury (Convertible Notes)</option>
                                <option value="general">General Inquiries</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" placeholder="John Doe" required />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="john@example.com" required />
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea rows="4" placeholder="Tell us about your firm or investment thesis..."></textarea>
                        </div>

                        <button type="submit" className="submit-btn">Send Inquiry</button>
                    </form>
                </div>
            </div>
        </>
    );
}
