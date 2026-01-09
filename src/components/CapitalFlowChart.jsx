import React, { useMemo } from 'react';

function getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

function getOrderColor(index, total) {
    if (total <= 1) return '#ff4d00';
    const t = index / (total - 1);
    const r = Math.round(255 + (0 - 255) * t);
    const g = Math.round(77 + (255 - 77) * t);
    const b = Math.round(0 + (0 - 0) * t);
    return `rgb(${r}, ${g}, ${b})`;
}

export default function CapitalFlowChart({ inputs, outputs, width = 800, height = 500 }) {
    const { paths, boxes, centerBox, totalCap } = useMemo(() => {
        const midX = width / 2;
        const poolWidth = 220; const poolHeight = 80; const poolY = (height - poolHeight) / 2;
        const totalCap = inputs.reduce((sum, item) => sum + item.val, 0);

        const typeSet = new Set();
        inputs.forEach(i => typeSet.add(i.type));
        outputs.forEach(i => typeSet.add(i.type));
        let orderedTypes = Array.from(typeSet).filter(t => !t.toLowerCase().includes('equity'));
        orderedTypes.push('Equity');

        const colorMap = {};
        orderedTypes.forEach((type, index) => { colorMap[type] = getOrderColor(index, orderedTypes.length); });

        const maxLineThickness = 70; const minLineThickness = 3; const boxH = 50;
        const textFont = "bold 12px sans-serif"; const valFont = "bold 18px sans-serif"; const padding = 20;

        const generatedPaths = [];
        const generatedBoxes = [];

        // Inputs
        const inStep = height / (inputs.length + 1);
        inputs.forEach((item, i) => {
            const y = (i + 1) * inStep;
            // User requested "bright blue" (cyan) for all regular lines
            let color = '#00f0ff';

            let displayLabel = item.label;
            if (item.type.toLowerCase().includes('token') && item.type.toLowerCase() !== 'token') {
                displayLabel = `${item.type.replace('Token ', '')}: ${item.label}`;
            }
            const labelW = getTextWidth(displayLabel, textFont);
            const valW = getTextWidth(`$${item.val}M`, valFont);
            const boxW = Math.max(labelW, valW) + padding;
            const boxX = 20; const lineStartX = boxX + boxW;

            let thickness = (item.val / totalCap) * maxLineThickness;
            if (thickness < minLineThickness) thickness = minLineThickness;

            const poolLeftY = poolY + (poolHeight * ((i + 1) / (inputs.length + 1)));
            const d = `M ${lineStartX} ${y} C ${lineStartX + 100} ${y}, ${midX - 10} ${poolLeftY}, ${midX} ${poolLeftY}`;

            generatedPaths.push({ d, color, thickness, type: item.type, isInput: true });
            generatedBoxes.push({ x: boxX, y: y, w: boxW, h: boxH, color, label: displayLabel, val: `$${item.val}M` });
        });

        // Outputs
        const outStep = height / (outputs.length + 1);
        outputs.forEach((item, i) => {
            const y = (i + 1) * outStep;

            // Default Blue
            let color = '#00f0ff';
            // VitaForge Inc. gets Orange
            if (item.label.toLowerCase().includes('vitaforge')) {
                color = '#ff4d00';
            }

            const labelW = getTextWidth(item.label, textFont);
            const valW = getTextWidth(`${item.val}%`, valFont);
            const boxW = Math.max(labelW, valW) + padding;
            const boxX = width - 20 - boxW; const lineEndX = boxX;

            const totalEquity = outputs.reduce((sum, item) => sum + item.val, 0);
            let thickness = (item.val / totalEquity) * maxLineThickness;
            if (thickness < minLineThickness) thickness = minLineThickness;

            const poolRightY = poolY + (poolHeight * ((i + 1) / (outputs.length + 1)));
            const d = `M ${midX} ${poolRightY} C ${midX + 10} ${poolRightY}, ${lineEndX - 100} ${y}, ${lineEndX} ${y}`;

            generatedPaths.push({ d, color, thickness, type: item.type, isInput: false });
            generatedBoxes.push({ x: boxX, y: y, w: boxW, h: boxH, color, label: item.label, val: `${item.val}%` });
        });

        const centerBox = { x: midX - poolWidth / 2, y: poolY, w: poolWidth, h: poolHeight };

        return { paths: generatedPaths, boxes: generatedBoxes, centerBox, totalCap };
    }, [inputs, outputs, width, height]);

    const [visible, setVisible] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <svg className="flow-svg" viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ff4d00', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            {paths.map((p, i) => {
                const delay = (() => {
                    const lower = p.type.toLowerCase();
                    let order = 0;
                    if (lower.includes('round 1')) order = 1;
                    else if (lower.includes('round 2')) order = 2;
                    else if (lower.includes('round 3')) order = 3;
                    else if (lower.includes('round 4')) order = 4;
                    else if (lower.includes('equity')) order = 5;
                    return (order - 1) * 1.5;
                })();

                return (
                    <path
                        key={`path-${i}`}
                        d={p.d}
                        className={p.isInput ? 'flow-path-in' : 'flow-path-out'}
                        data-type={p.type}
                        fill="none"
                        stroke={p.color}
                        strokeWidth={p.thickness}
                        style={{
                            strokeDashoffset: visible ? 0 : 2000,
                            transition: 'stroke-dashoffset 2.5s ease-in',
                            transitionDelay: `${delay}s`,
                            filter: `drop-shadow(0 0 5px ${p.color})` // Glowing effect
                        }}
                    />
                );
            })}
            {boxes.map((b, i) => (
                <g key={`box-${i}`}>
                    <rect
                        x={b.x} y={b.y - b.h / 2} width={b.w} height={b.h} rx="6"
                        fill="rgba(0,0,0,0.6)" stroke={b.color} strokeWidth="1"
                    />
                    <text x={b.x + b.w / 2} y={b.y - 6} className="flow-text" style={{ font: "bold 12px sans-serif" }} textAnchor="middle" fill="#fff">{b.label}</text>
                    <text x={b.x + b.w / 2} y={b.y + 12} className="flow-val" style={{ font: "bold 18px sans-serif" }} textAnchor="middle" fill="#fff">{b.val}</text>
                </g>
            ))}
            <g>
                <rect x={centerBox.x} y={centerBox.y} width={centerBox.w} height={centerBox.h} rx="15" className="flow-center-box" fill="transparent" stroke="url(#grad1)" strokeWidth="2" />
                <text x={width / 2} y={centerBox.y + 30} className="flow-text" textAnchor="middle" fontSize="16px" fill="#fff">TOTAL CAPITAL RAISED</text>
                <text x={width / 2} y={centerBox.y + 55} className="flow-val" textAnchor="middle" fill="#00f0ff" fontSize="20px" fontWeight="bold">${totalCap}M</text>
            </g>
        </svg>
    );
}
