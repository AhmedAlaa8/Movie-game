// ===== Tower Stack i18n =====
Object.assign(i18n.ar, {
    towerTitle: "بناء البرج",
    towerScore: "الطوابق",
    towerBest: "أفضل",
    towerTap: "اضغط لإسقاط الطابق",
    towerLoseTitle: "سقط البرج!",
    towerLoseMsg: "بنيت {s} طابق",
});
Object.assign(i18n.en, {
    towerTitle: "Tower Stack",
    towerScore: "Floors",
    towerBest: "Best",
    towerTap: "Tap to drop the block",
    towerLoseTitle: "Tower Fell!",
    towerLoseMsg: "You stacked {s} floors",
});

const TowerGame = {
    canvas: null, ctx: null, animId: null, state: null,
    W: 360, H: 500,

    onEnter() {
        this.canvas = document.getElementById("towerCanvas");
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.ctx = this.canvas.getContext("2d");
        this.bestScore = parseInt(localStorage.getItem("towerBest")) || 0;
        document.getElementById("towerBest").textContent = this.bestScore;

        this.canvas.addEventListener("click", () => this.drop());
        this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); this.drop(); }, { passive: false });
        this.reset();
    },
    onLeave() { if (this.animId) cancelAnimationFrame(this.animId); this.animId = null; },
    onLanguageChange() { if (!this.state.running) this.draw(); },

    reset() {
        if (this.animId) cancelAnimationFrame(this.animId);
        const baseW = 120;
        this.state = {
            stack: [{ x: (this.W - baseW) / 2, w: baseW, y: this.H - 30, h: 25 }],
            moving: { x: 0, w: baseW, dx: 3, h: 25 },
            score: 0, running: true, over: false,
            cameraY: 0, particles: [],
        };
        document.getElementById("towerScore").textContent = "0";
        this.loop();
    },

    drop() {
        if (this.state.over) { this.reset(); return; }
        if (!this.state.running) return;

        const s = this.state;
        const m = s.moving;
        const top = s.stack[s.stack.length - 1];
        const topY = top.y - top.h;

        // Calculate overlap
        const overlapLeft = Math.max(m.x, top.x);
        const overlapRight = Math.min(m.x + m.w, top.x + top.w);
        const overlapW = overlapRight - overlapLeft;

        if (overlapW <= 0) {
            // Missed completely
            this.gameOver();
            return;
        }

        // Spawn particles for cut-off part
        if (overlapW < m.w) {
            const cutX = m.x < top.x ? m.x : m.x + overlapW;
            const cutW = m.w - overlapW;
            for (let i = 0; i < 6; i++) {
                s.particles.push({
                    x: cutX + cutW / 2, y: topY + m.h / 2,
                    dx: (m.x < top.x ? -1 : 1) * (1 + Math.random() * 3),
                    dy: -1 + Math.random() * 3,
                    w: cutW / 3, h: m.h / 3,
                    life: 30,
                    color: this.getColor(s.score),
                });
            }
        }

        // Place block
        s.stack.push({ x: overlapLeft, w: overlapW, y: topY, h: m.h });
        s.score++;
        document.getElementById("towerScore").textContent = s.score;

        if (overlapW >= m.w - 2) {
            playSound("audioCorrect", 2);
        } else {
            playSound("audioCorrect", 3.5);
        }

        // Perfect placement bonus
        const perfect = Math.abs(overlapW - m.w) < 3;

        // Next moving block
        const speed = Math.min(6, 2.5 + s.score * 0.15);
        s.moving = {
            x: 0, w: perfect ? m.w : overlapW,
            dx: (s.score % 2 === 0 ? 1 : -1) * speed,
            h: m.h,
        };

        // Move camera up
        if (s.stack.length > 8) {
            s.cameraY += m.h;
        }
    },

    getColor(idx) {
        const colors = ["#ef4444","#f59e0b","#10b981","#6366f1","#ec4899","#8b5cf6","#14b8a6","#f97316"];
        return colors[idx % colors.length];
    },

    gameOver() {
        this.state.running = false;
        this.state.over = true;
        cancelAnimationFrame(this.animId);
        if (this.state.score > this.bestScore) {
            this.bestScore = this.state.score;
            localStorage.setItem("towerBest", this.bestScore);
            document.getElementById("towerBest").textContent = this.bestScore;
        }
        playSound("audioLose");
        const t = i18n[AppState.lang];
        showModal({ type: "lose", icon: "🏗️", title: t.towerLoseTitle, message: t.towerLoseMsg.replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
    },

    loop() {
        if (!this.state.running && !this.state.over) return;
        if (this.state.over) return;
        this.update();
        this.draw();
        this.animId = requestAnimationFrame(() => this.loop());
    },

    update() {
        const s = this.state;
        const m = s.moving;
        m.x += m.dx;
        if (m.x + m.w >= this.W) { m.x = this.W - m.w; m.dx = -Math.abs(m.dx); }
        if (m.x <= 0) { m.x = 0; m.dx = Math.abs(m.dx); }

        s.particles = s.particles.filter(p => {
            p.x += p.dx; p.y += p.dy; p.dy += 0.3; p.life--;
            return p.life > 0;
        });
    },

    draw() {
        const ctx = this.ctx, s = this.state;
        ctx.clearRect(0, 0, this.W, this.H);

        ctx.save();
        ctx.translate(0, s.cameraY);

        // Draw stack
        s.stack.forEach((block, i) => {
            ctx.fillStyle = this.getColor(i);
            ctx.beginPath();
            ctx.roundRect(block.x, block.y, block.w, block.h - 2, 3);
            ctx.fill();
            // Shine
            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.fillRect(block.x + 2, block.y + 1, block.w - 4, block.h / 3);
        });

        // Draw moving block
        if (s.running) {
            const top = s.stack[s.stack.length - 1];
            const movY = top.y - s.moving.h;
            ctx.fillStyle = this.getColor(s.score);
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.roundRect(s.moving.x, movY, s.moving.w, s.moving.h - 2, 3);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Particles
        for (const p of s.particles) {
            ctx.globalAlpha = p.life / 30;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
        }
        ctx.globalAlpha = 1;

        ctx.restore();

        // Tap hint
        if (s.score === 0 && s.running) {
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "15px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(i18n[AppState.lang].towerTap, this.W / 2, this.H / 2 - 40);
        }
    },
};
registerGame("towerstack", TowerGame);
