import React, { useEffect, useRef, useState } from 'react';
import '../styles/treasury.css';

export default function Treasury() {
    const canvasRef = useRef(null);
    // UI Refs for direct manipulation
    const vfPriceRef = useRef(null);
    const btcPriceRef = useRef(null);
    const levRatioRef = useRef(null);
    const marketCapRef = useRef(null);
    const mnavRef = useRef(null);
    const btcCounterRef = useRef(null);
    const debtCounterRef = useRef(null);
    const retiredCounterRef = useRef(null);
    const evCounterRef = useRef(null);
    const btcPerShareRef = useRef(null);
    const notePopupRef = useRef(null);
    const endMessageRef = useRef(null);
    const errorBoxRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const configRef = useRef({});
    const simulationDataRef = useRef(null);

    // 1. Fetch Data
    useEffect(() => {
        fetch('/data/treasury.json')
            .then(res => res.json())
            .then(data => {
                simulationDataRef.current = data;
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                if (errorBoxRef.current) {
                    errorBoxRef.current.innerText = "Error loading simulation data.";
                    errorBoxRef.current.style.display = "block";
                }
                // Stop loading even on error so we don't hang, though canvas init will fail or needs guard
                setLoading(false);
            });
    }, []);

    // 2. Initialize Simulation
    useEffect(() => {
        if (loading) return;
        if (!simulationDataRef.current) return; // Error case

        const canvas = canvasRef.current;
        if (!canvas) return;

        let animationId;
        let isRunning = true;

        // --- Init Config from Data ---
        const data = simulationDataRef.current;
        const config = configRef.current;

        config.startDate = new Date(data.globalSettings.startDate);
        config.endDate = new Date(data.globalSettings.endDate);
        config.startDate = new Date(data.globalSettings.startDate);
        config.endDate = new Date(data.globalSettings.endDate);
        // Calculate time per frame in milliseconds
        // 1 month (approx 30 days) in X seconds
        // Frames per month = secondsPerMonth * 60
        // Time per frame (ms) = (30 * 24 * 3600 * 1000) / (secondsPerMonth * 60)
        const secs = data.globalSettings.secondsPerMonth || 5;
        const msPerMonth = 30 * 24 * 60 * 60 * 1000;
        const framesPerMonth = secs * 60;
        config.timeFlowRate = msPerMonth / framesPerMonth; // ms per frame
        config.lowerVol = data.globalSettings.lowerRangeBitcoinVol;
        config.upperVol = data.globalSettings.upperRangeBitcoinVol;
        config.medianVol = data.globalSettings.medianVolStart;

        config.volSlope = data.globalSettings.medianVolSlope;
        config.volRandom = data.globalSettings.bitcoinVolRandomness;
        config.volUpdateFreq = data.globalSettings.bitcoinVolUpdateFreq;
        config.maxConvertFreq = data.globalSettings.maxBitcoinConvertFreq;
        config.btcStartPrice = data.globalSettings.bitcoinStartPrice;
        config.btcAnnualChangeMin = data.globalSettings.bitcoinAnnualChangeMin;
        config.btcAnnualChangeMax = data.globalSettings.bitcoinAnnualChangeMax;
        config.startShares = data.globalSettings.startingShares;

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

        // Simulation Variables
        let particles = [];
        let bitcoins = [];
        let btcBalance = 1500;
        let btcPrice = config.btcStartPrice;
        let outstandingDebt = 0;
        let retiredDebt = 0;
        let activeNotes = [];
        let currentShares = config.startShares;
        let dilutedShares = 0;
        let sharePrice = 10;
        let currentDate = new Date(config.startDate);
        let frameCount = 0;
        let lastNoteDate = new Date("2020-01-01");

        // Init Asset Instances
        let assetInstances = config.assets.map((a, i) => ({
            def: a,
            state: 'hidden',
            x: 100,
            y: 220 + (i * 120),
            nextMilestoneIdx: 0,
            currentEV: 0,
            color: '#00f0ff'
        }));

        // Ticker State
        let messageQueue = [];
        let currentTicker = null;
        let activeTickers = [];

        let currentBtcVol = 45;
        let medianVol = config.medianVol;
        let displayVol = 45;
        let equityVolatility = 0;
        let noteBoxIntensity = 0;
        let activePulseColor = '#ff4d00';
        const COLOR_ORANGE = '#ff4d00';
        const COLOR_NEON_GREEN = '#00ff00';

        const ctx = canvas.getContext('2d');
        let width = canvas.parentElement.clientWidth;
        let height = canvas.parentElement.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // Classes
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
                    // Pass asset name (from ref) and milestone name (this.text)
                    triggerAction("milestone", this.noteSize, { asset: assetRef.def.name, milestone: this.text });
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
            constructor(dVol) {
                this.x = 100; this.y = 80; this.targetX = width / 2; this.targetY = height / 2;
                this.speed = 5; this.text = `VOL > ${dVol}`; this.life = 1.0;
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

        // Functions
        function triggerAction(type, specificAmountUSD = null, details = null) {
            equityVolatility = 1.0;
            if (type === 'milestone') activePulseColor = COLOR_NEON_GREEN;
            else activePulseColor = COLOR_ORANGE;

            let amountUSD = 0;
            if (type === 'milestone') amountUSD = specificAmountUSD;
            else if (type === 'surge') {
                const newBTC = Math.floor(Math.random() * (1350 - 750) + 750);
                amountUSD = Math.floor((newBTC * btcPrice) / 1000000);
            } else if (type === 'exit') activePulseColor = '#ffffff';

            let msg = "";
            let leverageExceeded = false;

            if (type !== 'exit' && amountUSD > 0) {
                const potentialDebt = outstandingDebt + amountUSD;
                const currentTreasuryVal = (btcBalance * btcPrice) / 1000000;
                if (currentTreasuryVal > 0) {
                    const projectedLev = potentialDebt / currentTreasuryVal;
                    if (projectedLev > 0.20) {
                        amountUSD = 0;
                        leverageExceeded = true;
                    }
                }
            }

            let btcToEmit = 0;

            if (type === 'exit') {
                msg = `EXIT EVENT! BTC Buy`;
            } else {
                // Construct specific message prefix
                let prefix = "";
                if (type === 'milestone' && details) {
                    prefix = `${details.asset}: ${details.milestone}`;
                } else if (type === 'surge') {
                    prefix = "BTC: VOL > 60";
                } else if (type === 'milestone') {
                    prefix = "Milestone Reached";
                }

                if (leverageExceeded) {
                    // "VF1: IND Accepted: Leverage Exceeded" format or similar
                    // We use the prefix (Asset Name or BTC)
                    msg = `${prefix}: Leverage Exceeded`;
                } else if (amountUSD > 0) {
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

                    // Success Message
                    msg = `${prefix}. $${amountUSD}M note issued`;
                    noteBoxIntensity = 1.0;
                } else {
                    // Just a milestone without funding (amount == 0 passed)
                    msg = prefix;
                }
            }

            // Push to Queue for Scrolling Ticker
            if (msg) {
                messageQueue.push(msg);
            }

            if (type === 'exit' || btcToEmit > 0) {
                const isExit = (type === 'exit');
                const particleCount = isExit ? 25 : 8;
                const originX = width / 2;
                const offset = height * 0.3;
                const originY = isExit ? (height / 2 + offset) : (height / 2 - offset);

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

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 77, 0";
        }

        function animate() {
            if (!isRunning) return;
            ctx.clearRect(0, 0, width, height);
            frameCount++;
            // Use setTime/getTime for precise updates
            currentDate.setTime(currentDate.getTime() + config.timeFlowRate);

            if (currentDate >= config.endDate) {
                currentDate = config.endDate;
                isRunning = false;
                if (endMessageRef.current) endMessageRef.current.style.display = 'block';
                drawBitcoinVol(); drawAssetsAndExits(); drawEquityLine(); drawBoxes(); drawDateTicker(); return;
            }

            // Logic
            if (frameCount % config.volUpdateFreq === 0) {
                medianVol += config.volSlope;
                const noise = (Math.random() - 0.5) * config.volRandom;
                let v = medianVol + noise;
                if (v < config.lowerVol) v = config.lowerVol; if (v > config.upperVol) v = config.upperVol;
                currentBtcVol = v; displayVol = Math.floor(v);
            }



            // Calculate days passed as fraction for physics
            const daysPassed = config.timeFlowRate / (24 * 60 * 60 * 1000);
            const volFactor = 0.5 + ((currentBtcVol - 30) / 60) * 1.5;
            const annualDrift = (config.btcAnnualChangeMin + config.btcAnnualChangeMax) / 2;
            const dailyDrift = annualDrift / 365;
            const dailyVol = 0.02 * volFactor;
            const change = (dailyDrift * daysPassed) + (Math.random() - 0.5) * dailyVol * Math.sqrt(daysPassed);
            btcPrice = btcPrice * (1 + change);

            const treasuryValueUSD = btcBalance * btcPrice;
            const treasuryValueM = treasuryValueUSD / 1000000;

            let biotechEVM = 0;
            assetInstances.forEach(inst => {
                if (inst.state !== 'gone' && inst.state !== 'exiting') {
                    biotechEVM += inst.currentEV;
                }
            });
            const enterpriseValueM = treasuryValueM + biotechEVM;

            const totalShares = currentShares + dilutedShares;
            const floorPrice = treasuryValueUSD / totalShares;
            const targetPrice = (enterpriseValueM * 1000000) / totalShares;

            const drift = (targetPrice - sharePrice) * 0.05;
            const noiseSP = (Math.random() - 0.5) * (equityVolatility * 2);
            sharePrice += drift + noiseSP;
            if (sharePrice < floorPrice) sharePrice = floorPrice;

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

            // Update UI
            if (vfPriceRef.current) vfPriceRef.current.innerText = `$${sharePrice.toFixed(2)}`;
            if (btcCounterRef.current) btcCounterRef.current.innerText = Math.floor(btcBalance).toLocaleString();
            if (btcPriceRef.current) btcPriceRef.current.innerText = `$${Math.floor(btcPrice).toLocaleString()}`;
            const lev = outstandingDebt * 1000000 / treasuryValueUSD;
            if (levRatioRef.current) levRatioRef.current.innerText = (outstandingDebt > 0 && treasuryValueUSD > 0) ? `${lev.toFixed(2)}x` : "0.00x";
            const mCap = sharePrice * totalShares;
            if (marketCapRef.current) marketCapRef.current.innerText = `$${(mCap / 1000000).toLocaleString('en-US', { maximumFractionDigits: 0 })}M`;
            const mnav = treasuryValueUSD > 0 ? (mCap / treasuryValueUSD) : 0;
            if (mnavRef.current) mnavRef.current.innerText = mnav.toFixed(2) + "x";
            if (debtCounterRef.current) debtCounterRef.current.innerText = `$${Math.floor(outstandingDebt).toLocaleString()}M`;
            if (retiredCounterRef.current) retiredCounterRef.current.innerText = `$${Math.floor(retiredDebt).toLocaleString()}M`;
            if (evCounterRef.current) evCounterRef.current.innerText = `$${Math.floor(enterpriseValueM).toLocaleString()}M`;
            if (btcPerShareRef.current) btcPerShareRef.current.innerText = (btcBalance / totalShares).toFixed(6);

            // Asset Positioning
            let stackIndex = 0;
            assetInstances.forEach(inst => {
                if (inst.state === 'hidden' || inst.state === 'active') {
                    const targetY = 220 + (stackIndex * 120);
                    // Increased lerp speed from 0.05 to 0.1 for snappier gap filling
                    if (Math.abs(inst.y - targetY) > 1) inst.y += (targetY - inst.y) * 0.1;
                    stackIndex++;
                }
            });

            // Triggers
            if (currentBtcVol > 60) {
                const threeMonths = 90 * 24 * 60 * 60 * 1000;
                let isClear = true;
                if (currentDate.getTime() - lastNoteDate.getTime() < threeMonths) isClear = false;
                for (let inst of assetInstances) {
                    for (let i = inst.nextMilestoneIdx; i < inst.def.milestones.length; i++) {
                        const m = inst.def.milestones[i];
                        const diff = m.date.getTime() - currentDate.getTime();
                        if (diff > 0 && diff < threeMonths) isClear = false;
                    }
                }

                if (isClear) {
                    particles.push(new VolatilityParticle(displayVol));
                    lastNoteDate = new Date(currentDate);
                }
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

            // Draw
            // Draw
            drawBitcoinVol(); drawAssetsAndExits(); drawEquityLine(); drawBoxes(); drawDateTicker(); drawTicker();

            particles.forEach((p, i) => {
                if (p.assetRef) p.update(p.assetRef); else p.update();
                p.draw(ctx);
                if (p.life <= 0) particles.splice(i, 1);
            });
            bitcoins.forEach((b, i) => { b.update(); b.draw(ctx); if (b.life <= 0) bitcoins.splice(i, 1); });

            animationId = requestAnimationFrame(animate);
        }

        // Draw Helpers
        function drawTicker() {
            // Box dimensions (must match drawEquityLine)
            const centerY = height / 2;
            const startX = width * 0.275;
            const endX = width * 0.65;
            const rectH = 200;
            const bottomY = centerY + (rectH / 2) - 10; // 10px padding from bottom

            ctx.save();
            // Clip to box area to handle scrolling text masking
            ctx.beginPath();
            ctx.roundRect(startX - 10, centerY - rectH / 2, (endX - startX) + 20, rectH, 15);
            ctx.clip();

            // Spawn next message if gap allows
            if (messageQueue.length > 0) {
                let canSpawn = false;
                if (activeTickers.length === 0) {
                    canSpawn = true;
                } else {
                    // Check gap from the last spawned ticker
                    const lastTicker = activeTickers[activeTickers.length - 1];
                    const nextText = messageQueue[0];
                    const nextWidth = ctx.measureText(nextText).width;

                    // Gap Logic: 10px spacing
                    // lastTicker.x (Left Edge) must be > startX + nextWidth + 10
                    if (lastTicker.x > (startX + nextWidth + 10)) {
                        canSpawn = true;
                    }
                }

                if (canSpawn) {
                    const text = messageQueue.shift();
                    activeTickers.push({
                        text: text,
                        x: startX - 20,
                        width: ctx.measureText(text).width
                    });
                }
            }

            if (!currentTicker && activeTickers.length === 0 && messageQueue.length > 0) {
                // Initial catch - should be handled by logic above, but keeping safe fallback if needed
                // actually the logic above handles it.
            }

            // Update and Draw active tickers
            for (let i = activeTickers.length - 1; i >= 0; i--) {
                let t = activeTickers[i];
                ctx.fillText(t.text, t.x, bottomY);
                t.x += 2; // Scroll Right

                // Remove if fully off screen
                if (t.x > endX + 20) {
                    activeTickers.splice(i, 1);
                }
            }

            // Legacy cleanup
            if (currentTicker && currentTicker.text) {
                // handle left over if any
            }
            ctx.restore();
        }

        function drawBitcoinVol() {
            const bx = 100; const by = 80;
            ctx.shadowColor = COLOR_ORANGE; ctx.shadowBlur = 10; ctx.strokeStyle = COLOR_ORANGE; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(bx, by, 35, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
            ctx.fillStyle = COLOR_ORANGE; ctx.font = "bold 30px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("₿", bx, by);
            ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.fillText(`${displayVol} VOL`, bx, by + 50);
            ctx.fillStyle = "#00f0ff"; ctx.font = "bold 12px sans-serif"; ctx.fillText("BIOTECH ASSETS", bx, by + 80);
        }

        function drawAssetsAndExits() {
            const offset = height * 0.3;
            const exitX = width / 2; const exitY = height / 2 + offset;
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
            const centerY = height / 2;

            // Trim 25% from left (was 0.15 start, now 0.275 start)
            const startX = width * 0.275;
            const endX = width * 0.65; // Total range is roughly 37.5% of width now
            const rectH = 200;

            // Background Rectangle (Black with rounded corners)
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.roundRect(startX - 10, centerY - rectH / 2, (endX - startX) + 20, rectH, 15);
            ctx.fill();

            // Line Logic
            ctx.beginPath();
            ctx.moveTo(startX, centerY);
            equityVolatility *= 0.96;
            const amplitude = 10 + (equityVolatility * 100);
            const lineColor = equityVolatility > 0.1 ? activePulseColor : 'rgba(0, 240, 255, 0.3)';

            for (let x = startX; x <= endX; x += 5) {
                // Changed flow to Left to Right -> (x - frameCount)
                const y = centerY + Math.sin((x - frameCount) * 0.05) * amplitude * Math.sin(x * 0.02);
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = lineColor; ctx.lineWidth = 2 + (equityVolatility * 3); ctx.shadowColor = lineColor; ctx.shadowBlur = equityVolatility * 20; ctx.stroke(); ctx.shadowBlur = 0;

            // Draw Title Text (Over line, under milestones)
            ctx.fillStyle = "#00f0ff";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            // Padding: 10px inside the rect (startX + 5, top is centerY - 100) -> -90
            ctx.fillText("EQUITY VOLATILITY", startX, centerY - 90);
        }

        function drawBoxes() {
            const offset = height * 0.3;
            const cx = width / 2; const noteY = height / 2 - offset; const exitY = height / 2 + offset;
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


        // Initial Draw to show static state behind shield
        drawBitcoinVol(); drawAssetsAndExits(); drawEquityLine(); drawBoxes(); drawDateTicker(); drawTicker();

        if (started) {
            animate();
        }

        return () => {
            isRunning = false;
            cancelAnimationFrame(animationId);
        };
    }, [loading, started]);

    if (loading) return <div className="container" style={{ color: 'white' }}>Loading Treasury Simulation...</div>;

    return (
        <div className="container">
            <img src="/src/assets/VitaForge_Logo.png" alt="VitaForge Logo" className="header-logo" />
            <p className="strategy-text">
                We monetize volatility. Assets (Left) drive milestones. Milestones drive equity volatility (Center).
                We harvest this volatility via Convertible Notes when implied volatility spikes or Bitcoin surges,
                converting premium into <span className="highlight-text">Bitcoin Yield</span> (Right).
            </p>
            <div id="error-box" ref={errorBoxRef}></div>

            <div className="animation-container">
                <canvas ref={canvasRef}></canvas>
                {!started && !loading && (
                    <div className="start-shield">
                        <button className="start-btn" onClick={() => setStarted(true)}>GO</button>
                    </div>
                )}
                <div className="anim-label label-treasury">Treasury Performance</div>

                <div className="treasury-counter">
                    <div className="counter-column">
                        <div>
                            <div className="hero-amount" ref={vfPriceRef} id="vf-price">$10.00</div>
                            <div className="btc-label">VitaForge Price</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={btcPriceRef} id="btc-price">$93,000</div>
                            <div className="btc-label">Bitcoin Price</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={levRatioRef} id="leverage-ratio">0.00x</div>
                            <div className="btc-label">Leverage Ratio</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={marketCapRef} id="market-cap">$100M</div>
                            <div className="btc-label">Market Cap</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={mnavRef} id="mnav">1.00x</div>
                            <div className="btc-label">mNAV</div>
                        </div>
                    </div>

                    <div className="counter-column">
                        <div>
                            <div className="hero-amount" ref={btcCounterRef} id="btc-counter">1,500</div>
                            <div className="btc-label">Total BTC Treasury</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={debtCounterRef} id="debt-counter">$0M</div>
                            <div className="btc-label">Outstanding Debt</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={retiredCounterRef} id="retired-counter">$0M</div>
                            <div className="btc-label">Retired Debt</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={evCounterRef} id="ev-counter">$150M</div>
                            <div className="btc-label">Enterprise Value</div>
                        </div>
                        <div>
                            <div className="sub-amount" ref={btcPerShareRef} id="btc-per-share">0.00015</div>
                            <div className="btc-label">Bitcoin per Share</div>
                        </div>
                    </div>
                </div>

                <div className="note-info" ref={notePopupRef} id="note-popup">Issuing Note: $75M</div>
                <div className="status-message" ref={endMessageRef} id="end-message">Simulation Complete</div>
            </div>
        </div>
    );
}
