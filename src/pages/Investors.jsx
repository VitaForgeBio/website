import React, { useState } from 'react';
import '../styles/investors.css';

export default function Investors() {
    const [interest, setInterest] = useState('biotech');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState({ submitting: false, success: false, error: null });

    // TODO: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDfLjGE0UDWyJjCBbpCNH13CWkVg6HVSJOi8MJd84WandPnm2cPOwXcG2JrxjKnvo/exec";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (GOOGLE_SCRIPT_URL === "INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE") {
            alert("Please deploy the Google Apps Script and update the URL in Investors.jsx first.");
            return;
        }

        setStatus({ submitting: true, success: false, error: null });

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                // specific 'text/plain' content type prevents CORS preflight OPTIONS request
                // which Google Apps Script does not handle
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    interest,
                    ...formData
                }),
            });

            if (response.ok) {
                setStatus({ submitting: false, success: true, error: null });
                setFormData({ name: '', email: '', message: '' }); // Reset form
                setInterest('biotech');
            } else {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Form error:", error);
            setStatus({ submitting: false, success: false, error: "Failed to submit. Please try again." });
        }
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

                    {status.success ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
                            <h3>Request Received</h3>
                            <p>Thank you. Our team will review your profile and contact you shortly.</p>
                            <button
                                onClick={() => setStatus({ ...status, success: false })}
                                style={{ marginTop: '1rem', background: 'transparent', border: '1px solid currentColor', color: '#4ade80', padding: '0.5rem 1rem', cursor: 'pointer' }}
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
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
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    rows="4"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us about your firm or investment thesis..."
                                    required
                                ></textarea>
                            </div>

                            {status.error && (
                                <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
                                    {status.error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={status.submitting}
                                style={{ opacity: status.submitting ? 0.7 : 1 }}
                            >
                                {status.submitting ? 'Sending...' : 'Send Inquiry'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
