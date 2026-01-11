import React from 'react';
import '../styles/team.css';

const Team = () => {
    const teamMembers = [
        {
            name: "Chris Nicholson, JD/PhD",
            role: "Bitcoin Treasury Strategy",
            title: "Founder / Board Member",
            code: "BTC-STRAT",
            stats: "Alloc: 100%"
        },
        {
            name: "Brian Bodemann, PhD",
            role: "PhD Pharmacology",
            title: "Founder / CEO",
            code: "PHD-PHARM",
            stats: "Founded: 1, Led: 1,Pubs: 12"
        },
        {
            name: "Patrick Crutcher",
            role: "Biotech Strategy",
            title: "Founder / Board Member",
            code: "BIZ-DEV",
            stats: "Founded: 5, Led: 5, Exits: 3"
        },
        {
            name: "Michael Torres, PhD",
            role: "Biotech Strategy",
            title: "Founder / Board Member",
            code: "BIO-STRAT",
            stats: "Founded: 2, Led: 1, Pubs: 7"
        },
        {
            name: "Anthony Schwartz, PhD",
            role: "Operations",
            title: "Founder / Operations",
            code: "OPS",
            stats: "Founded: 3, Led: 5, Pubs: 18"
        }
    ];

    return (
        <div className="page-header team-container">
            {/* 1. The Metrics Header */}
            <div className="metrics-ticker">
                <div className="metric-item">
                    <span className="metric-value">11</span>
                    <span className="metric-label">Companies Founded</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">15</span>
                    <span className="metric-label">Companies Led</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">37</span>
                    <span className="metric-label">Scientific Publications</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">∞</span>
                    <span className="metric-label">Time Preference</span>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="content-grid">

                {/* 2. The Manifesto */}
                <div className="manifesto-section">
                    <div className="terminal-header">MISSION</div>
                    <div className="manifesto-text">
                        UNBLOCK THE PIPELINE. We recognized that the "Valley of Death" is an efficiency problem, not a science problem. Viable pre-clinical assets are stuck in limbo, and traditional models are too slow to rescue them.
                    </div>

                    <div className="terminal-header">EXECUTION</div>
                    <div className="manifesto-text">
                        VitaForge conquers this deficiency by rewriting the operating manual. By integrating a Bitcoin treasury for long-term endurance, an AI operations layer for speed, and scaled asset-specific funding for precision, we bypass the bottlenecks entirely.
                    </div>

                    <div className="terminal-header">STATUS</div>
                    <div className="manifesto-text">
                        Seeding the longevity sector with de-risked assets.
                    </div>
                </div>

                {/* 3. The Team Grid */}
                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="team-card">
                            <div className="node-visual">
                                <div className="hex">
                                    <span className="node-icon">⬢</span>
                                </div>
                            </div>
                            <div className="member-name">{member.name}</div>
                            <div className="member-role">{member.role}</div>
                            <div className="member-title">{member.title}</div>
                            <div className="member-stats">
                                <span>ID: {member.code}</span>
                                <div className="stats-scroll-wrapper">
                                    <span className="stats-scroll-content">{member.stats}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* The AI Member */}
                    <div className="team-card ai-card">
                        <div className="node-visual">
                            <div className="hex">
                                <span className="node-icon">⚡</span>
                            </div>
                        </div>
                        <div className="member-role">Efficient G&A</div>
                        <div className="member-title">AI Operations</div>
                        <div className="member-stats">
                            <span>ID: AI-CORE</span>
                            <div className="stats-scroll-wrapper">
                                <span className="stats-scroll-content">Uptime: 99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Team;
