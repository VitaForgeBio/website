const canvas = document.getElementById('harvestCanvas');
const ctx = canvas.getContext('2d');
const notePopup = document.getElementById('note-popup');
const errorBox = document.getElementById('error-box');
const endMessage = document.getElementById('end-message');

// UI Elements
const elVfPrice = document.getElementById('vf-price');
const elBtcPrice = document.getElementById('btc-price');
const elLevRatio = document.getElementById('leverage-ratio');
const elMarketCap = document.getElementById('market-cap');
const elMnav = document.getElementById('mnav');
const elBtcCounter = document.getElementById('btc-counter');
const elDebt = document.getElementById('debt-counter');
const elRetired = document.getElementById('retired-counter');
const elEv = document.getElementById('ev-counter');
const elBtcPerShare = document.getElementById('btc-per-share');

let width, height;

// --- GLOBAL SETTINGS ---
const config = {
    startDate: new Date("2026-01-01"),
    endDate: new Date("2030-01-01"),
    timeFlowRate: 3,
    lowerVol: 30,
    upperVol: 90,
    medianVol: 45,
    volSlope: 0.05,
    volRandom: 10,
    volUpdateFreq: 10,
    maxConvertFreq: 180,
    btcStartPrice: 93000,
    btcAnnualChangeMin: -0.20,
    btcAnnualChangeMax: 0.50,
    startShares: 10000000,
    assets: []
};

// Fallback markdown
const defaultMarkdown = `
# Global Settings
Time Start Date: 2026-01-01
Time End Date: 2030-01-01
Time Flow Rate: 3
Starting Total VitaForge Shares: 100000000
Lower Range Bitcoin VOL: 30
Upper Range Bitcoin VOL: 95
Median VOL Start: 45
Median VOL Slope: 0.05
Bitcoin Vol Randomness Factor: 15
Bitcoin Vol Update Frequency: 5
Max Bitcoin Convert Frequency: 120
Bitcoin Start Price: 93000
Bitcoin Annual Change Min: -0.20
Bitcoin Annual Change Max: 0.50

# VF-1
Name: Anti-GDF-15
Milestones:
- 2026-06-01: Phase 1 Data [Note: 75] [EV: 150]
- 2026-12-01: IND Filing [Note: 0] [EV: 200]
- 2027-06-01: Patent Granted [Note: 100] [EV: 350]
- 2027-12-01: FDA Fast Track [Note: 0] [EV: 500]
Exit Date: 2028-06-01
Exit Amount: 2500

# VF-2
Name: tRNA Gene Therapy
Milestones:
- 2026-08-01: Preclinical Result [Note: 0] [EV: 50]
- 2027-02-01: Tox Report [Note: 80] [EV: 120]
- 2027-08-01: CMC Complete [Note: 0] [EV: 180]
- 2028-02-01: IRB Approval [Note: 120] [EV: 300]
Exit Date: 2029-01-01
Exit Amount: 4000
`;

// --- STATE ---
let particles = [];
let bitcoins = [];
let btcBalance = 1500;
let btcPrice = 93000;

let outstandingDebt = 0;
let retiredDebt = 0;
let activeNotes = [];

let currentShares = 10000000;
let dilutedShares = 0;
let sharePrice = 10;

let currentDate;
let frameCount = 0;
let lastConvertFrame = -999;
let lastNoteDate = new Date("2020-01-01");
let isRunning = true;

let assetInstances = [];

let currentBtcVol = 45;
let medianVol = 45;
let displayVol = 45;

let equityVolatility = 0;
let noteBoxIntensity = 0;
let activePulseColor = '#ff4d00';
const COLOR_ORANGE = '#ff4d00';
const COLOR_NEON_GREEN = '#00ff00';

// --- INIT ---
function resize() {
    if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
    }
}
window.addEventListener('resize', resize);
resize();

async function loadData() {
    try {
        const response = await fetch('treasury.json');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Map Global Settings
        config.startDate = new Date(data.globalSettings.startDate);
        config.endDate = new Date(data.globalSettings.endDate);
        config.timeFlowRate = data.globalSettings.timeFlowRate;
        config.lowerVol = data.globalSettings.lowerRangeBitcoinVol;
        config.upperVol = data.globalSettings.upperRangeBitcoinVol;
        config.medianVol = data.globalSettings.medianVolStart;
        medianVol = config.medianVol;
        config.volSlope = data.globalSettings.medianVolSlope;
        config.volRandom = data.globalSettings.bitcoinVolRandomness;
        config.volUpdateFreq = data.globalSettings.bitcoinVolUpdateFreq;
        config.maxConvertFreq = data.globalSettings.maxBitcoinConvertFreq;
        config.btcStartPrice = data.globalSettings.bitcoinStartPrice;
        config.btcAnnualChangeMin = data.globalSettings.bitcoinAnnualChangeMin;
        config.btcAnnualChangeMax = data.globalSettings.bitcoinAnnualChangeMax;
        config.startShares = data.globalSettings.startingShares;

        // Map Assets
        config.assets = data.assets.map(asset => ({
            name: asset.name,
            exitDate: new Date(asset.exitDate),
            exitAmount: asset.exitAmount,
            milestones: asset.milestones.map(m => ({
                date: new Date(m.date),
                name: m.name,
                noteSize: m.note,
                ev: m.ev
            }))
        }));

        startSimulation();
    } catch (e) {
        console.error("Error loading treasury.json:", e);
        // We can't really fall back easily since the format changed completely.
        alert("Error loading treasury configuration.");
    }
}


function startSimulation() {
    currentDate = new Date(config.startDate);
    btcPrice = config.btcStartPrice;
    currentShares = config.startShares;

    assetInstances = config.assets.map((a, i) => ({
        def: a,
        state: 'hidden',
        x: 100,
        y: 220 + (i * 120),
        nextMilestoneIdx: 0,
        currentEV: 0,
        color: '#00f0ff'
    }));
    animate();
}

// --- CLASSES ---
class MilestoneParticle {
    constructor(startX, startY, milestoneName, noteSize, evVal) {
        this.x = startX; this.y = startY;
        this.targetX = width / 2; this.targetY = height / 2;
        this.speed = 4; this.text = milestoneName;
        this.noteSize = noteSize; this.evVal = evVal;
        this.life = 1.0;
    }
    update(assetRef) {
        const dx = this.targetX - this.x; const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) {
            this.life = 0;
            if (this.evVal > 0) assetRef.currentEV = this.evVal;
            triggerAction("milestone", this.noteSize);
            if (this.noteSize > 0) lastNoteDate = new Date(currentDate);
        } else {
            this.x += (dx / dist) * this.speed; this.y += (dy / dist) * this.speed;
        }
    }
    draw(ctx) {
        ctx.fillStyle = COLOR_NEON_GREEN; ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.font = "17px sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
        ctx.fillText(this.text, this.x + 15, this.y - 25);
    }
}

class VolatilityParticle {
    constructor(displayVol) {
        this.x = 100; this.y = 80; this.targetX = width / 2; this.targetY = height / 2;
        this.speed = 5; this.text = `VOL > ${displayVol}`; this.life = 1.0;
    }
    update() {
        const dx = this.targetX - this.x; const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) { this.life = 0; triggerAction("surge"); }
        else { this.x += (dx / dist) * this.speed; this.y += (dy / dist) * this.speed; }
    }
    draw(ctx) {
        ctx.fillStyle = COLOR_ORANGE; ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(this.text, this.x, this.y - 25);
    }
}

class BitcoinParticle {
    constructor(startX, startY, isExit) {
        this.x = startX; this.y = startY;
        this.vx = (Math.random() * 6) + 2; this.vy = (Math.random() - 1) * 6;
        this.gravity = 0.25; this.life = 1.0; this.text = "₿"; this.isBig = isExit;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
        if (this.x > width - 100 || this.y > 200) this.life -= 0.04;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life; ctx.fillStyle = "#ff4d00";
        ctx.font = this.isBig ? "bold 30px sans-serif" : "bold 22px sans-serif";
        ctx.fillText(this.text, this.x, this.y); ctx.globalAlpha = 1;
    }
}

// --- LOGIC ---

function updateSimulation() {
    if (frameCount % config.volUpdateFreq === 0) {
        medianVol += config.volSlope;
        const noise = (Math.random() - 0.5) * config.volRandom;
        let v = medianVol + noise;
        if (v < config.lowerVol) v = config.lowerVol; if (v > config.upperVol) v = config.upperVol;
        currentBtcVol = v; displayVol = Math.floor(v);
    }

    const daysPassed = config.timeFlowRate;
    const volFactor = 0.5 + ((currentBtcVol - 30) / 60) * 1.5;
    const annualDrift = (config.btcAnnualChangeMin + config.btcAnnualChangeMax) / 2;
    const dailyDrift = annualDrift / 365;
    const dailyVol = 0.02 * volFactor;
    const change = (dailyDrift * daysPassed) + (Math.random() - 0.5) * dailyVol * Math.sqrt(daysPassed);
    btcPrice = btcPrice * (1 + change);

    // EV Calculation
    const treasuryValueUSD = btcBalance * btcPrice;
    const treasuryValueM = treasuryValueUSD / 1000000;

    let biotechEVM = 0;
    assetInstances.forEach(inst => {
        if (inst.state !== 'gone' && inst.state !== 'exiting') {
            biotechEVM += inst.currentEV;
        }
    });
    const enterpriseValueM = treasuryValueM + biotechEVM;

    // Share Price
    const totalShares = currentShares + dilutedShares;
    const floorPrice = treasuryValueUSD / totalShares;
    const targetPrice = (enterpriseValueM * 1000000) / totalShares;

    const drift = (targetPrice - sharePrice) * 0.05;
    const noiseSP = (Math.random() - 0.5) * (equityVolatility * 2);
    sharePrice += drift + noiseSP;

    if (sharePrice < floorPrice) sharePrice = floorPrice;

    // Conversions
    for (let i = activeNotes.length - 1; i >= 0; i--) {
        const note = activeNotes[i];
        if (sharePrice > note.conversionPrice) {
            outstandingDebt -= note.amount;
            retiredDebt += note.amount;
            dilutedShares -= note.shareCount;
            currentShares += note.shareCount;
            activeNotes.splice(i, 1);
        } else if (currentDate >= note.retireDate) {
            outstandingDebt -= note.amount;
            retiredDebt += note.amount;
            dilutedShares -= note.shareCount;
            activeNotes.splice(i, 1);
        }
    }

    updateUI(treasuryValueUSD, enterpriseValueM, totalShares);
}

function updateUI(treasuryValueUSD, enterpriseValueM, totalShares) {
    elVfPrice.innerText = `$${sharePrice.toFixed(2)}`;
    elBtcCounter.innerText = Math.floor(btcBalance).toLocaleString();
    elBtcPrice.innerText = `$${Math.floor(btcPrice).toLocaleString()}`;

    const lev = outstandingDebt * 1000000 / treasuryValueUSD;
    elLevRatio.innerText = (outstandingDebt > 0 && treasuryValueUSD > 0) ? `${lev.toFixed(2)}x` : "0.00x";

    const mCap = sharePrice * totalShares;
    elMarketCap.innerText = `$${(mCap / 1000000).toLocaleString('en-US', { maximumFractionDigits: 0 })}M`;

    const mnav = treasuryValueUSD > 0 ? (mCap / treasuryValueUSD) : 0;
    elMnav.innerText = mnav.toFixed(2) + "x";

    elDebt.innerText = `$${Math.floor(outstandingDebt).toLocaleString()}M`;
    elRetired.innerText = `$${Math.floor(retiredDebt).toLocaleString()}M`;
    elEv.innerText = `$${Math.floor(enterpriseValueM).toLocaleString()}M`;
    elBtcPerShare.innerText = (btcBalance / totalShares).toFixed(6);
}

function isWindowClear(checkDate) {
    const threeMonths = 90 * 24 * 60 * 60 * 1000;
    if (checkDate.getTime() - lastNoteDate.getTime() < threeMonths) return false;
    for (let inst of assetInstances) {
        for (let i = inst.nextMilestoneIdx; i < inst.def.milestones.length; i++) {
            const m = inst.def.milestones[i];
            const diff = m.date.getTime() - checkDate.getTime();
            if (diff > 0 && diff < threeMonths) return false;
        }
    }
    return true;
}

function checkTriggers() {
    if (currentBtcVol > 60 && isWindowClear(currentDate)) {
        particles.push(new VolatilityParticle(displayVol));
        lastNoteDate = new Date(currentDate);
    }

    assetInstances.forEach(inst => {
        if (inst.state === 'gone') return;

        if (inst.def.exitDate && currentDate >= inst.def.exitDate && inst.state !== 'exiting') {
            inst.state = 'exiting';
            inst.currentEV = 0;
        }

        if (inst.state === 'hidden') {
            if (inst.def.milestones.length > 0 && currentDate >= inst.def.milestones[0].date) {
                inst.state = 'active';
                const m = inst.def.milestones[0];
                const p = new MilestoneParticle(inst.x, inst.y, m.name, m.noteSize, m.ev);
                p.assetRef = inst;
                particles.push(p);
                inst.nextMilestoneIdx = 1;
            }
        } else if (inst.state === 'active') {
            if (inst.nextMilestoneIdx < inst.def.milestones.length) {
                const m = inst.def.milestones[inst.nextMilestoneIdx];
                if (currentDate >= m.date) {
                    const p = new MilestoneParticle(inst.x, inst.y, m.name, m.noteSize, m.ev);
                    p.assetRef = inst;
                    particles.push(p);
                    inst.nextMilestoneIdx++;
                }
            }
        }
    });
}

function updateAssetPositions() {
    let stackIndex = 0;
    assetInstances.forEach(inst => {
        if (inst.state === 'hidden' || inst.state === 'active') {
            const targetY = 220 + (stackIndex * 120);
            if (Math.abs(inst.y - targetY) > 1) inst.y += (targetY - inst.y) * 0.05;
            stackIndex++;
        }
    });
}

function triggerAction(type, specificAmountUSD = null) {
    equityVolatility = 1.0;
    if (type === 'milestone') activePulseColor = COLOR_NEON_GREEN;
    else activePulseColor = COLOR_ORANGE;

    let amountUSD = 0;
    if (type === 'milestone') amountUSD = specificAmountUSD;
    else if (type === 'surge') {
        const newBTC = Math.floor(Math.random() * (1350 - 750) + 750);
        amountUSD = Math.floor((newBTC * btcPrice) / 1000000);
    } else if (type === 'exit') activePulseColor = '#ffffff';

    if (type !== 'exit' && amountUSD > 0) {
        const potentialDebt = outstandingDebt + amountUSD;
        const currentTreasuryVal = (btcBalance * btcPrice) / 1000000;
        if (currentTreasuryVal > 0) {
            const projectedLev = potentialDebt / currentTreasuryVal;
            if (projectedLev > 0.20) {
                amountUSD = 0;
                notePopup.innerText = "Leverage Cap Hit: Issuance Canceled";
                notePopup.style.borderColor = "#ff0000";
                notePopup.classList.add('visible');
                setTimeout(() => notePopup.classList.remove('visible'), 2000);
                return;
            }
        }
    }

    let msg = "";
    let btcToEmit = 0;

    if (type === 'exit') {
        msg = `EXIT EVENT! Liquidating...`;
    } else {
        if (amountUSD > 0) {
            outstandingDebt += amountUSD;
            const rDate = new Date(currentDate);
            rDate.setFullYear(rDate.getFullYear() + 6);

            const strikePrice = sharePrice * 1.4;
            const noteShares = (amountUSD * 1000000) / strikePrice;
            dilutedShares += noteShares;

            activeNotes.push({
                amount: amountUSD,
                retireDate: rDate,
                conversionPrice: strikePrice,
                shareCount: noteShares
            });

            btcToEmit = Math.floor((amountUSD * 1000000) / btcPrice);
            if (type === 'milestone') msg = `Milestone: Raising $${amountUSD}M`;
            else msg = `Vol > 60: Raising $${amountUSD}M`;
            noteBoxIntensity = 1.0;
        } else {
            if (type === 'milestone') msg = `Milestone Reached`;
        }
    }

    if (msg) {
        notePopup.innerText = msg;
        notePopup.style.borderColor = activePulseColor;
        notePopup.classList.add('visible');
        setTimeout(() => notePopup.classList.remove('visible'), 2000);
    }

    if (type === 'exit' || btcToEmit > 0) {
        const isExit = (type === 'exit');
        const particleCount = isExit ? 25 : 8;
        const originX = width / 2;
        const originY = isExit ? (height / 2 + 90) : (height / 2 - 90);

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => bitcoins.push(new BitcoinParticle(originX, originY, isExit)), i * 50);
        }

        if (btcToEmit > 0) incrementCounter(btcToEmit);
    }
}

function incrementCounter(amount) {
    const target = btcBalance + amount;
    const inc = (target - btcBalance) / 30;
    let step = 0;
    const interval = setInterval(() => {
        btcBalance += inc;
        step++;
        if (step >= 30) {
            btcBalance = target;
            clearInterval(interval);
        }
    }, 30);
}

// --- DRAW FUNCTIONS ---

function drawBitcoinVol() {
    const bx = 100; const by = 80;
    ctx.shadowColor = COLOR_ORANGE; ctx.shadowBlur = 10; ctx.strokeStyle = COLOR_ORANGE; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bx, by, 35, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR_ORANGE; ctx.font = "bold 30px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("₿", bx, by);
    ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.fillText(`${displayVol} VOL`, bx, by + 50);
    ctx.fillStyle = "#00f0ff"; ctx.font = "bold 12px sans-serif"; ctx.fillText("BIOTECH ASSETS", bx, by + 80);
}

function drawAssetsAndExits() {
    const exitX = width / 2; const exitY = height / 2 + 90;
    assetInstances.forEach(inst => {
        if (inst.state === 'hidden' || inst.state === 'gone') return;
        let drawX = inst.x; let drawY = inst.y;
        if (inst.state === 'exiting') {
            const dx = exitX - inst.x; const dy = exitY - inst.y; const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) {
                triggerAction('exit');
                const exitBTC = Math.floor((inst.def.exitAmount * 1000000) / btcPrice);
                incrementCounter(exitBTC);
                inst.currentEV = 0;
                inst.state = 'gone'; return;
            }
            inst.x += dx * 0.05; inst.y += dy * 0.05; drawX = inst.x; drawY = inst.y;
        }
        ctx.shadowColor = inst.color; ctx.shadowBlur = 15; ctx.fillStyle = "#0f1d2e"; ctx.strokeStyle = inst.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(drawX, drawY, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(inst.def.name, drawX, drawY);
    });
}

function drawEquityLine() {
    const centerY = height / 2; ctx.beginPath(); ctx.moveTo(width * 0.15, centerY);
    equityVolatility *= 0.96;
    const amplitude = 5 + (equityVolatility * 60);
    const lineColor = equityVolatility > 0.1 ? activePulseColor : 'rgba(0, 240, 255, 0.3)';
    for (let x = width * 0.15; x <= width * 0.65; x += 5) {
        const y = centerY + Math.sin((x + frameCount) * 0.05) * amplitude * Math.sin(x * 0.02);
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2 + (equityVolatility * 3); ctx.shadowColor = lineColor; ctx.shadowBlur = equityVolatility * 20; ctx.stroke(); ctx.shadowBlur = 0;
}

function drawBoxes() {
    const cx = width / 2; const noteY = height / 2 - 90; const exitY = height / 2 + 90;
    noteBoxIntensity *= 0.96;
    const glow = noteBoxIntensity > 0.1 ? 1 : 0.2;
    const boxColor = noteBoxIntensity > 0.1 ? activePulseColor : '#ff4d00';
    ctx.fillStyle = `rgba(15, 29, 46, 0.8)`; ctx.strokeStyle = `rgba(${hexToRgb(boxColor)}, ${glow})`; ctx.lineWidth = 2;
    if (noteBoxIntensity > 0.1) ctx.fillStyle = `rgba(${hexToRgb(activePulseColor)}, 0.2)`;
    ctx.beginPath(); ctx.roundRect(cx - 140, noteY - 40, 280, 80, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("CONVERTIBLE NOTE", cx, noteY);

    ctx.fillStyle = `rgba(15, 29, 46, 0.8)`; ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    const isExiting = assetInstances.some(a => a.state === 'exiting' && Math.abs(a.y - exitY) < 50);
    if (isExiting) { ctx.strokeStyle = "#ffffff"; ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 20; } else { ctx.shadowBlur = 0; }
    ctx.beginPath(); ctx.roundRect(cx - 140, exitY - 40, 280, 80, 10); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.fillText("EXIT EVENT", cx, exitY);
}

function drawDateTicker() {
    const y = height - 40; const startX = 50; const endX = width - 50; const totalWidth = endX - startX;
    ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.strokeStyle = "#1a2f45"; ctx.lineWidth = 4; ctx.stroke();
    const startSim = config.startDate.getTime(); const endSim = config.endDate.getTime();
    const totalDuration = endSim - startSim; const currentDuration = currentDate.getTime() - startSim;
    let progress = currentDuration / totalDuration; if (progress > 1) progress = 1;
    const currentX = startX + (totalWidth * progress);
    ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(currentX, y); ctx.strokeStyle = "#ff4d00"; ctx.lineWidth = 4; ctx.stroke();
    const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    ctx.fillStyle = "#ff4d00"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center"; ctx.fillText(dateStr, currentX, y - 15);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 77, 0";
}

function animate() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);
    frameCount++;
    currentDate.setDate(currentDate.getDate() + config.timeFlowRate);

    if (currentDate >= config.endDate) {
        currentDate = config.endDate; isRunning = false; endMessage.style.display = 'block';
        drawBitcoinVol(); drawAssetsAndExits(); drawEquityLine(); drawBoxes(); drawDateTicker(); return;
    }

    updateSimulation(); updateAssetPositions(); checkTriggers();
    drawBitcoinVol(); drawAssetsAndExits(); drawEquityLine(); drawBoxes(); drawDateTicker();

    particles.forEach((p, i) => {
        if (p.assetRef) p.update(p.assetRef); else p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(i, 1);
    });
    bitcoins.forEach((b, i) => { b.update(); b.draw(ctx); if (b.life <= 0) bitcoins.splice(i, 1); });

    requestAnimationFrame(animate);
}

if (sessionStorage.getItem("vf_access_granted")) {
    loadData();
} else {
    window.addEventListener('vf-app-start', loadData);
}
