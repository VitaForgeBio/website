import React, { useState, useEffect, useMemo } from 'react';
import useAssets from '../hooks/useAssets';
import CapitalFlowChart from '../components/CapitalFlowChart';
import '../styles/dashboard.css';

function formatMoney(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    return num.toLocaleString();
}

export default function Dashboard() {
    const { assets, loading, error } = useAssets();
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [view, setView] = useState('background');
    const [exitValue, setExitValue] = useState(0);

    // Initialize exit value when asset changes
    useEffect(() => {
        if (selectedAsset) {
            setExitValue(selectedAsset.tokenData.min);
        }
    }, [selectedAsset]);

    const openModal = (asset) => {
        setSelectedAsset(asset);
        setView('background');
    };

    const closeModal = () => setSelectedAsset(null);

    // Tokenomics Calculations
    const tokenomicsTable = useMemo(() => {
        if (!selectedAsset) return [];
        const { tokenData, capitalInputs, capitalOutputs } = selectedAsset;
        const types = new Set(capitalInputs.map(i => i.type));
        const rows = [];
        const totalTokens = tokenData.total;

        types.forEach(type => {
            if (type.toLowerCase().includes('equity')) return;
            // Val is in Millions USD
            const inputSumMillions = capitalInputs.filter(i => i.type === type).reduce((s, i) => s + i.val, 0);
            const inputSum = inputSumMillions * 1000000;
            // Output percent is total percent (0-100)
            const outputPercentSum = capitalOutputs.filter(i => i.type === type).reduce((s, i) => s + i.val, 0);

            let entryPrice = 0;
            if (outputPercentSum > 0 && totalTokens > 0) {
                // Entry Price = Total Capital / (Total Tokens * fraction owned)
                // fraction owned = outputPercentSum / 100
                const tokensOwned = totalTokens * (outputPercentSum / 100);
                entryPrice = inputSum / tokensOwned;
            }
            rows.push({ type, entryPrice, outputPercent: outputPercentSum });
        });

        // Calculate returns
        const uniformExitPrice = totalTokens > 0 ? Number(exitValue) / totalTokens : 0;
        return rows.map(row => {
            const ret = row.entryPrice > 0.000001 ? uniformExitPrice / row.entryPrice : 0;
            return { ...row, ret, uniformExitPrice };
        });

    }, [selectedAsset, exitValue]);

    if (loading) return <div className="container" style={{ color: 'white' }}>Loading Assets...</div>;
    if (error) return <div className="container" style={{ color: 'red' }}>Error loading assets.</div>;

    return (
        <div className="container">
            <header className="page-header" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1>Asset Dashboard</h1>
                <p className="subtitle" style={{ textAlign: 'center', margin: '0' }}>Select an asset to view details.</p>
            </header>

            <div id="grid" className="grid">
                {assets.map(asset => {
                    const offset = 100 - asset.percent;
                    return (
                        <div key={asset.id} className="asset-card" onClick={() => openModal(asset)}>
                            <svg className="gauge-svg" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" className="gauge-bg" />
                                <circle
                                    cx="50" cy="50" r="40" className="gauge-fill"
                                    pathLength="100" strokeDasharray="100" strokeDashoffset={offset}
                                />
                            </svg>
                            <div className="asset-info">
                                <div className="asset-name">{asset.id}</div>
                                <div className="asset-percent">{asset.name}<br />{asset.percent}% Complete</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedAsset && (
                <div id="overlay" className={`modal-overlay ${selectedAsset ? 'active' : ''}`}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={closeModal}>CLOSE VIEW</button>

                        <div className="modal-toggle-container">
                            <div className="toggle-wrapper">
                                <div className={`toggle-btn ${view === 'background' ? 'active' : ''}`} onClick={() => setView('background')}>Background</div>
                                <div className={`toggle-btn ${view === 'progress' ? 'active' : ''}`} onClick={() => setView('progress')}>Progress</div>
                                <div className={`toggle-btn ${view === 'capital' ? 'active-orange' : ''}`} onClick={() => setView('capital')}>Capital Flow</div>
                                <div className={`toggle-btn ${view === 'tokenomics' ? 'active-green' : ''}`} onClick={() => setView('tokenomics')}>Tokenomics</div>
                            </div>
                        </div>

                        {view === 'background' && (
                            <div id="modal-view-background" className="modal-view">
                                <div className="background-text-container">
                                    <div className="background-text-title" id="bg-view-title">{selectedAsset.name}</div>
                                    <div className="background-text-body" id="bg-view-body" style={{ lineHeight: 1.6, fontSize: '1.1rem', textAlign: 'left' }}>
                                        {selectedAsset.background || "No background information."}
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'progress' && (
                            <div id="modal-view-progress" className="modal-view" style={{ overflow: 'visible' }}>
                                <svg className="connector-lines" id="connector-svg" style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible' }}>
                                    {selectedAsset.milestones.map((m, i) => {
                                        const radius = 250; const centerX = 450; const centerY = 325;
                                        const pct = Number(m.at);
                                        const degrees = (pct / 100) * 360 - 90;
                                        const angle = degrees * (Math.PI / 180);
                                        // Line should stop 10px before the node (radius 250). So target radius ~240? 
                                        // Actually node is at 250. Let's start from near center gauge (radius 40, so e.g. 50) to near node (250 - X)
                                        // User said: "rendering to within 10 px of the out side of the circle". 
                                        // Inside circle r=40. Outside circle... user probably means the central gauge.
                                        // Let's assume lines go from near center to near node.

                                        // Center Gauge Radius is 40 (d=80). 
                                        // Lines currently go from centerX/Y to x/y.
                                        // Fix: x1/y1 should be at radius ~50 from center. x2/y2 at radius ~210 from center (node is at 250).

                                        const innerR = 95;
                                        const outerR = 180; // Node is at 250. Milestone node width ~150px? Node center is at 250.
                                        // Let's shorten it.

                                        const x1 = centerX + innerR * Math.cos(angle);
                                        const y1 = centerY + innerR * Math.sin(angle);
                                        const x2 = centerX + outerR * Math.cos(angle);
                                        const y2 = centerY + outerR * Math.sin(angle);

                                        return (
                                            <line
                                                key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                                                className={`connector-line ${pct > selectedAsset.percent ? 'future' : ''}`}
                                            />
                                        );
                                    })}
                                </svg>
                                <div id="milestones-layer" className="milestone-container">
                                    {selectedAsset.milestones.map((m, i) => {
                                        const radius = 185; // Start just outside the line end (180 + 5px)
                                        const centerX = 450; const centerY = 325;
                                        const pct = Number(m.at);
                                        const degrees = (pct / 100) * 360 - 90;
                                        const angle = degrees * (Math.PI / 180);
                                        const cos = Math.cos(angle);
                                        const sin = Math.sin(angle);
                                        const x = centerX + radius * cos;
                                        const y = centerY + radius * sin;

                                        // Dynamic Anchor Logic: Arrange by nearest point to circle
                                        let transform = 'translate(0%, -50%)'; // Default: Anchor Left-Middle (Box extends Right)
                                        if (Math.abs(cos) < 0.2) { // Vertical-ish
                                            if (sin < 0) transform = 'translate(-50%, -100%)'; // Top: Anchor Bottom-Center
                                            else transform = 'translate(-50%, 0%)'; // Bottom: Anchor Top-Center
                                        } else if (cos < 0) { // Left Side
                                            transform = 'translate(-100%, -50%)'; // Anchor Right-Middle (Box extends Left)
                                        }

                                        const isFuture = pct > selectedAsset.percent;
                                        return (
                                            <div
                                                key={i}
                                                className={`milestone-node ${isFuture ? 'future' : ''}`}
                                                style={{ left: `${x}px`, top: `${y}px`, transform: transform }}
                                            >
                                                {pct}%: {m.text}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="modal-gauge-container">
                                    <svg className="gauge-svg" viewBox="0 0 100 100" style={{ width: '200px', height: '200px', overflow: 'visible' }}>
                                        <circle cx="50" cy="50" r="40" className="gauge-bg" />
                                        <circle
                                            cx="50" cy="50" r="40" className="gauge-fill"
                                            pathLength="100"
                                            strokeDasharray="100" strokeDashoffset={100 - selectedAsset.percent}
                                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <h2 id="modal-title" style={{ margin: 0, color: 'var(--highlight-cyan)', fontSize: '2rem' }}>{selectedAsset.id}</h2>
                                        <span id="modal-percent" style={{ color: '#aaa' }}>{selectedAsset.percent}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'capital' && (
                            <div id="modal-view-capital" className="modal-view">
                                <div id="modal-flow-container">
                                    <CapitalFlowChart inputs={selectedAsset.capitalInputs} outputs={selectedAsset.capitalOutputs} />
                                </div>
                            </div>
                        )}

                        {view === 'tokenomics' && (
                            <div id="modal-view-tokenomics" className="modal-view">
                                <table className="token-table">
                                    <thead>
                                        <tr>
                                            <th>Release</th>
                                            <th>Entry Token Price</th>
                                            <th>Exit Token Price</th>
                                            <th>Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tokenomicsTable.map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.type.replace('Tokens', '').trim()}</td>
                                                <td>${row.entryPrice < 0.01 ? row.entryPrice.toFixed(4) : row.entryPrice.toFixed(2)}</td>
                                                <td>${row.uniformExitPrice < 0.01 ? row.uniformExitPrice.toFixed(4) : row.uniformExitPrice.toFixed(2)}</td>
                                                <td className={row.ret >= 1.0 ? 'val-positive' : 'val-neutral'}>{row.ret.toFixed(1)}X</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="total-tokens-container">
                                    <div className="total-tokens-label">Total Token Supply</div>
                                    <div className="total-tokens-value" id="total-tokens-display">{selectedAsset.tokenData.total.toLocaleString()}</div>
                                </div>
                                <div className="slider-container">
                                    <div className="slider-labels">
                                        <span id="slider-min-label">Min: ${formatMoney(selectedAsset.tokenData.min)}</span>
                                        <span id="slider-max-label">Max: ${formatMoney(selectedAsset.tokenData.max)}</span>
                                    </div>
                                    <input
                                        type="range" min={selectedAsset.tokenData.min} max={selectedAsset.tokenData.max} step="1000000"
                                        value={exitValue}
                                        onChange={(e) => setExitValue(parseFloat(e.target.value))}
                                        style={{
                                            // Calculate percent (0-100)
                                            // Offset formula: +10px (at 0%) -> -10px (at 100%).
                                            // This aligns the background fill edge exactly with the center of the 20px thumb.
                                            // Formula: calc(P% + (10px - (P/100 * 20px)))
                                            backgroundSize: `calc(${(exitValue - selectedAsset.tokenData.min) * 100 / (selectedAsset.tokenData.max - selectedAsset.tokenData.min)}% + ${10 - ((exitValue - selectedAsset.tokenData.min) * 100 / (selectedAsset.tokenData.max - selectedAsset.tokenData.min)) / 100 * 20}px) 100%`
                                        }}
                                    />
                                    <div className="current-val-display" style={{ marginTop: '15px', fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>
                                        Target Exit<sup>*</sup>: <span id="slider-val-display" style={{ color: 'var(--highlight-cyan)' }}>${formatMoney(exitValue)}</span>
                                    </div>
                                    <div className="disclaimer-text">*Total deal size less taxes, fees, and closing costs.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
