// DOM Elements
const grid = document.getElementById('grid');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const modalPercent = document.getElementById('modal-percent');
const modalFill = document.getElementById('modal-gauge-fill');
const milestonesLayer = document.getElementById('milestones-layer');
const connectorSvg = document.getElementById('connector-svg');
const flowContainer = document.getElementById('modal-flow-container');
const errorBox = document.getElementById('error-box');

const bgViewTitle = document.getElementById('bg-view-title');
const bgViewBody = document.getElementById('bg-view-body');

const tableBody = document.getElementById('token-table-body');
const exitSlider = document.getElementById('exit-slider');
const sliderValDisplay = document.getElementById('slider-val-display');
const sliderMinLabel = document.getElementById('slider-min-label');
const sliderMaxLabel = document.getElementById('slider-max-label');
const totalTokensDisplay = document.getElementById('total-tokens-display');

let currentAsset = null;

async function loadAssets() {
    try {
        const response = await fetch('assets.json');
        if (!response.ok) throw new Error("File not found");
        const assets = await response.json();
        // The JSON structure matches what renderGrid expects, except `milestones` might need mapping if keys differ.
        // In assets.json: milestones have { completed: 10, label: "..." }
        // renderGrid expects: { at: 10, text: "..." }
        // Let's normalize it here.
        const normalizedAssets = assets.map(asset => ({
            ...asset,
            id: asset.id, // mapped from JSON 'id'
            name: asset.name, // mapped from JSON 'name'
            background: asset.background,
            percent: asset.current, // mapped from JSON 'current'
            milestones: asset.milestones.map(m => ({ at: m.completed, text: m.label })),
            capitalInputs: asset.capitalFlow.filter(c => c.type === 'Input').map(c => ({
                type: c.round, // using 'round' as type to match legacy logic
                label: c.label,
                val: c.amount / 1000000 // Convert back to Millions for display logic
            })),
            capitalOutputs: asset.capitalFlow.filter(c => c.type === 'Output').map(c => ({
                type: c.label.includes('Token') ? c.label : 'Equity', // Heuristic to match legacy type logic
                label: c.label,
                val: c.percent
            })),
            tokenData: {
                total: asset.tokenomics.totalTokens,
                min: asset.tokenomics.exitTargetMin,
                max: asset.tokenomics.exitTargetMax
            }
        }));
        renderGrid(normalizedAssets);
    } catch (e) {
        console.error("Error loading assets:", e);
        errorBox.style.display = 'block';
    }
}

function renderGrid(assets) {
    grid.innerHTML = '';
    assets.forEach((asset, index) => {
        const card = document.createElement('div');
        card.className = 'asset-card';
        const offset = 100 - asset.percent;
        card.innerHTML = `
            <svg class="gauge-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" class="gauge-bg" />
                <circle cx="50" cy="50" r="40" class="gauge-fill" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="stroke-dashoffset: ${offset};" />
            </svg>
            <div class="asset-info">
                <div class="asset-name">${asset.id}</div>
                <div class="asset-percent">${asset.name}<br>${asset.percent}% Complete</div>
            </div>
        `;
        card.onclick = () => openModal(asset);
        grid.appendChild(card);
    });
}

function openModal(asset) {
    currentAsset = asset;
    bgViewTitle.innerText = asset.name;
    bgViewBody.innerText = asset.background || "No background information available.";
    modalTitle.innerText = asset.id;
    modalPercent.innerText = `${asset.percent}%`;
    modalFill.style.transition = 'none';
    modalFill.style.strokeDashoffset = 100;
    const flowSVG = createCapitalFlowSVG(asset.capitalInputs || [], asset.capitalOutputs || []);
    flowContainer.innerHTML = flowSVG;
    setupTokenomicsView(asset);
    switchModalView('background');
    overlay.classList.add('active');
    setTimeout(() => {
        modalFill.style.transition = 'stroke-dasharray 1.5s ease-out, stroke-dashoffset 1.5s ease-out';
        modalFill.style.strokeDashoffset = 100 - asset.percent;
    }, 50);
    drawMilestonesDynamic(asset.milestones, asset.percent);
}

function setupTokenomicsView(asset) {
    const data = asset.tokenData;
    exitSlider.min = data.min;
    exitSlider.max = data.max;
    exitSlider.value = data.min;
    updateSliderBackground(exitSlider);
    sliderMinLabel.innerText = `Min: $${formatMoney(data.min)}`;
    sliderMaxLabel.innerText = `Max: $${formatMoney(data.max)}`;
    updateSliderDisplay(data.min);
    totalTokensDisplay.innerText = data.total.toLocaleString();
    const types = new Set();
    asset.capitalInputs.forEach(i => types.add(i.type));
    const rows = [];
    types.forEach(type => {
        if (type.toLowerCase().includes('equity')) return;
        const inputSumMillions = asset.capitalInputs.filter(i => i.type === type).reduce((s, i) => s + i.val, 0);
        const inputSum = inputSumMillions * 1000000;
        const outputPercentSum = asset.capitalOutputs.filter(i => i.type === type).reduce((s, i) => s + i.val, 0);
        let entryPrice = 0;
        if (outputPercentSum > 0 && data.total > 0) entryPrice = inputSum / (data.total * (outputPercentSum / 100));
        rows.push({ type: type, entryPrice: entryPrice, outputPercent: outputPercentSum });
    });
    exitSlider.oninput = function () {
        const currentVal = parseFloat(this.value);
        updateSliderDisplay(currentVal);
        updateSliderBackground(this);
        renderTokenTable(rows, data.total, currentVal);
    };
    renderTokenTable(rows, data.total, data.min);
}

function updateSliderBackground(el) {
    const val = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.backgroundSize = `${val}% 100%`;
}

function updateSliderDisplay(val) {
    sliderValDisplay.innerText = `$${formatMoney(val)}`;
}

function renderTokenTable(rows, totalTokens, sliderVal) {
    tableBody.innerHTML = '';
    let uniformExitPrice = 0;
    if (totalTokens > 0) uniformExitPrice = sliderVal / totalTokens;
    rows.forEach(row => {
        let ret = 0;
        if (row.entryPrice > 0) ret = uniformExitPrice / row.entryPrice;
        const tr = document.createElement('tr');
        const entryStr = row.entryPrice < 0.01 ? row.entryPrice.toFixed(4) : row.entryPrice.toFixed(2);
        const exitStr = uniformExitPrice < 0.01 ? uniformExitPrice.toFixed(4) : uniformExitPrice.toFixed(2);
        const retStr = ret.toFixed(1) + 'X';
        const retClass = ret >= 1.0 ? 'val-positive' : 'val-neutral';
        tr.innerHTML = `<td>${row.type.replace('Tokens', '').trim()}</td><td>$${entryStr}</td><td>$${exitStr}</td><td class="${retClass}">${retStr}</td>`;
        tableBody.appendChild(tr);
    });
}

function formatMoney(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    return num.toLocaleString();
}

window.switchModalView = function (view) {
    const btnBg = document.getElementById('btn-background');
    const btnProg = document.getElementById('btn-progress');
    const btnCap = document.getElementById('btn-capital');
    const btnTok = document.getElementById('btn-tokenomics');
    const viewBg = document.getElementById('modal-view-background');
    const viewProg = document.getElementById('modal-view-progress');
    const viewCap = document.getElementById('modal-view-capital');
    const viewTok = document.getElementById('modal-view-tokenomics');

    [viewBg, viewProg, viewCap, viewTok].forEach(v => v.classList.add('hidden'));
    [btnBg, btnProg, btnCap, btnTok].forEach(b => {
        b.classList.remove('active'); b.classList.remove('active-orange'); b.classList.remove('active-green');
    });

    if (view === 'background') { viewBg.classList.remove('hidden'); btnBg.classList.add('active'); }
    else if (view === 'progress') { viewProg.classList.remove('hidden'); btnProg.classList.add('active'); }
    else if (view === 'capital') {
        viewCap.classList.remove('hidden'); btnCap.classList.add('active-orange');
        if (currentAsset) {
            document.querySelectorAll('.flow-path-in, .flow-path-out').forEach(el => { el.classList.remove('animate'); el.style.strokeDashoffset = 2000; });
            setTimeout(() => { runFlowAnimation(currentAsset.capitalInputs || [], currentAsset.capitalOutputs || []); }, 50);
        }
    }
    else if (view === 'tokenomics') { viewTok.classList.remove('hidden'); btnTok.classList.add('active-green'); }
}

async function runFlowAnimation(inputs, outputs) {
    const typeSet = new Set();
    inputs.forEach(i => typeSet.add(i.type));
    outputs.forEach(i => typeSet.add(i.type));
    let orderedTypes = Array.from(typeSet).filter(t => !t.toLowerCase().includes('equity'));
    orderedTypes.push('Equity');
    for (const type of orderedTypes) {
        const inPaths = document.querySelectorAll(`.flow-path-in[data-type="${type}"]`);
        if (inPaths.length > 0) {
            inPaths.forEach(el => { el.classList.add('animate'); el.style.strokeDashoffset = 0; });
            await new Promise(r => setTimeout(r, 475));
        }
        const outPaths = document.querySelectorAll(`.flow-path-out[data-type="${type}"]`);
        if (outPaths.length > 0) {
            outPaths.forEach(el => { el.classList.add('animate'); el.style.strokeDashoffset = 0; });
            await new Promise(r => setTimeout(r, 750));
        }
    }
}

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

function createCapitalFlowSVG(inputs, outputs) {
    const w = 800; const h = 500; const midX = w / 2;
    const poolWidth = 220; const poolHeight = 80; const poolY = (h - poolHeight) / 2;
    const totalCap = inputs.reduce((sum, item) => sum + item.val, 0);
    const typeSet = new Set();
    inputs.forEach(i => typeSet.add(i.type));
    outputs.forEach(i => typeSet.add(i.type));
    let orderedTypes = Array.from(typeSet);
    const colorMap = {};
    orderedTypes.forEach((type, index) => { colorMap[type] = getOrderColor(index, orderedTypes.length); });
    const maxLineThickness = 70; const minLineThickness = 3; const boxH = 50;
    const textFont = "bold 12px sans-serif"; const valFont = "bold 18px sans-serif"; const padding = 20;
    let svgContent = '';
    const inStep = h / (inputs.length + 1);
    inputs.forEach((item, i) => {
        const y = (i + 1) * inStep;
        let color = colorMap[item.type];
        let displayLabel = item.label;
        if (item.type.toLowerCase().includes('token') && item.type.toLowerCase() !== 'token') { displayLabel = `${item.type.replace('Token ', '')}: ${item.label}`; }
        const labelW = getTextWidth(displayLabel, textFont);
        const valW = getTextWidth(`$${item.val}M`, valFont);
        const boxW = Math.max(labelW, valW) + padding;
        const boxX = 20; const lineStartX = boxX + boxW;
        let thickness = (item.val / totalCap) * maxLineThickness;
        if (thickness < minLineThickness) thickness = minLineThickness;
        const poolLeftY = poolY + (poolHeight * ((i + 1) / (inputs.length + 1)));
        const path = `M ${lineStartX} ${y} C ${lineStartX + 100} ${y}, ${midX - 10} ${poolLeftY}, ${midX} ${poolLeftY}`;
        svgContent += `<path d="${path}" class="flow-path-in" data-type="${item.type}" fill="none" stroke="${color}" stroke-width="${thickness}" />`;
        svgContent += `<rect x="${boxX}" y="${y - boxH / 2}" width="${boxW}" height="${boxH}" rx="6" fill="rgba(0,0,0,0.6)" stroke="${color}" stroke-width="1" />`;
        svgContent += `<text x="${boxX + boxW / 2}" y="${y - 6}" class="flow-text" style="font:${textFont}" text-anchor="middle">${displayLabel}</text>`;
        svgContent += `<text x="${boxX + boxW / 2}" y="${y + 12}" class="flow-val" style="font:${valFont}" text-anchor="middle">$${item.val}M</text>`;
    });
    const outStep = h / (outputs.length + 1);
    outputs.forEach((item, i) => {
        const y = (i + 1) * outStep;
        let color = colorMap[item.type];
        const labelW = getTextWidth(item.label, textFont);
        const valW = getTextWidth(`${item.val}%`, valFont);
        const boxW = Math.max(labelW, valW) + padding;
        const boxX = w - 20 - boxW; const lineEndX = boxX;
        const totalEquity = outputs.reduce((sum, item) => sum + item.val, 0);
        let thickness = (item.val / totalEquity) * maxLineThickness;
        if (thickness < minLineThickness) thickness = minLineThickness;
        const poolRightY = poolY + (poolHeight * ((i + 1) / (outputs.length + 1)));
        const path = `M ${midX} ${poolRightY} C ${midX + 10} ${poolRightY}, ${lineEndX - 100} ${y}, ${lineEndX} ${y}`;
        svgContent += `<path d="${path}" class="flow-path-out" data-type="${item.type}" fill="none" stroke="${color}" stroke-width="${thickness}" />`;
        svgContent += `<rect x="${boxX}" y="${y - boxH / 2}" width="${boxW}" height="${boxH}" rx="6" fill="rgba(0,0,0,0.6)" stroke="${color}" stroke-width="1" />`;
        svgContent += `<text x="${boxX + boxW / 2}" y="${y - 6}" class="flow-text" style="font:${textFont}" text-anchor="middle">${item.label}</text>`;
        svgContent += `<text x="${boxX + boxW / 2}" y="${y + 12}" class="flow-val" style="font:${valFont}" text-anchor="middle">${item.val}%</text>`;
    });
    svgContent += `<rect x="${midX - poolWidth / 2}" y="${poolY}" width="${poolWidth}" height="${poolHeight}" rx="15" class="flow-center-box" />`;
    svgContent += `<text x="${midX}" y="${poolY + 30}" class="flow-text" text-anchor="middle" font-size="16px">TOTAL CAPITAL RAISED</text>`;
    svgContent += `<text x="${midX}" y="${poolY + 55}" class="flow-val" text-anchor="middle" fill="#00f0ff" font-size="20px" font-weight="bold">$${totalCap}M</text>`;
    const defs = `<defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#00f0ff;stop-opacity:1" /><stop offset="100%" style="stop-color:#ff4d00;stop-opacity:1" /></linearGradient></defs>`;
    return `<svg class="flow-svg" viewBox="0 0 ${w} ${h}">${defs}${svgContent}</svg>`;
}

function drawMilestonesDynamic(milestones, currentPercent) {
    milestonesLayer.innerHTML = '';
    connectorSvg.innerHTML = '';
    const radius = 250; const centerX = 450; const centerY = 325;
    const createdNodes = [];
    milestones.forEach((milestone) => {
        const isFuture = milestone.at > currentPercent;
        const degrees = (milestone.at / 100) * 360 - 90;
        const angle = degrees * (Math.PI / 180);
        const targetX = centerX + radius * Math.cos(angle);
        const targetY = centerY + radius * Math.sin(angle);
        const node = document.createElement('div');
        node.className = 'milestone-node';
        if (isFuture) node.classList.add('future');
        node.innerText = `${milestone.at}%: ${milestone.text}`;
        node.style.left = `${targetX}px`;
        node.style.top = `${targetY}px`;
        milestonesLayer.appendChild(node);
        createdNodes.push({ node, targetX, targetY, isFuture });
    });
    setTimeout(() => {
        createdNodes.forEach((item) => {
            let rect = item.node.getBoundingClientRect();
            if (rect.width === 0) rect = { width: 100, height: 50 };
            const halfDiagonal = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
            const buffer = halfDiagonal + 15;
            const dx = item.targetX - centerX;
            const dy = item.targetY - centerY;
            const totalDistance = Math.sqrt(dx * dx + dy * dy);
            const startRatio = 110 / totalDistance;
            const endRatio = (totalDistance - buffer) / totalDistance;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('x1', centerX + dx * startRatio);
            line.setAttribute('y1', centerY + dy * startRatio);
            line.setAttribute('x2', centerX + dx * endRatio);
            line.setAttribute('y2', centerY + dy * endRatio);
            line.classList.add('connector-line');
            if (item.isFuture) line.classList.add('future');
            connectorSvg.appendChild(line);
        });
    }, 10);
}

window.closeModal = function () { overlay.classList.remove('active'); };

// AUTH CHECK LOGIC
if (sessionStorage.getItem("vf_access_granted")) {
    loadAssets();
} else {
    window.addEventListener('vf-app-start', loadAssets);
}
