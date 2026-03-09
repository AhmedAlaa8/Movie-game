// ===== Dodge Game i18n =====
Object.assign(i18n.ar, {
    dodgeTitle: "تفادي السقوط",
    dodgeScore: "النتيجة",
    dodgeBest: "أفضل",
    dodgeTap: "اضغط أو تحرك للبدء",
    dodgeLoseTitle: "انتهت اللعبة!",
    dodgeLoseMsg: "نتيجتك: {s}",
});
Object.assign(i18n.en, {
    dodgeTitle: "Dodge",
    dodgeScore: "Score",
    dodgeBest: "Best",
    dodgeTap: "Tap or move to start",
    dodgeLoseTitle: "Game Over!",
    dodgeLoseMsg: "Your score: {s}",
});

const DodgeGame = {
    canvas: null, ctx: null, animId: null, state: null,
    W: 360, H: 500,

    onEnter() {
        this.canvas = document.getElementById("dodgeCanvas");
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.ctx = this.canvas.getContext("2d");
        this.bestScore = parseInt(localStorage.getItem("dodgeBest")) || 0;
        document.getElementById("dodgeBest").textContent = this.bestScore;

        this.canvas.addEventListener("mousemove", (e) => this.onMove(e));
        this.canvas.addEventListener("touchmove", (e) => { e.preventDefault(); this.onTouch(e); }, { passive: false });
        this.canvas.addEventListener("click", () => { if (this.state && !this.state.running) this.start(); });
        this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); if (this.state && !this.state.running) this.start(); }, { passive: false });
        this.reset();
    },
    onLeave() { if (this.animId) cancelAnimationFrame(this.animId); this.animId = null; },
    onLanguageChange() { if (!this.state.running) this.draw(); },

    onMove(e) {
        if (!this.state) return;
        const rect = this.canvas.getBoundingClientRect();
        this.state.player.x = ((e.clientX - rect.left) / rect.width) * this.W;
    },
    onTouch(e) {
        if (!this.state) return;
        const rect = this.canvas.getBoundingClientRect();
        this.state.player.x = ((e.touches[0].clientX - rect.left) / rect.width) * this.W;
    },

    reset() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.animId = null;
        this.state = {
            player: { x: this.W / 2, y: this.H - 40, r: 14 },
            obstacles: [], coins: [], particles: [],
            score: 0, frame: 0, running: false, over: false, speed: 2,
        };
        document.getElementById("dodgeScore").textContent = "0";
        this.draw();
    },

    start() {
        if (this.state.over) { this.reset(); }
        this.state.running = true;
        this.loop();
    },

    loop() {
        if (!this.state.running) return;
        this.update();
        this.draw();
        this.animId = requestAnimationFrame(() => this.loop());
    },

    update() {
        const s = this.state;
        s.frame++;
        s.speed = 2 + s.score * 0.05;

        // Spawn obstacles
        if (s.frame % Math.max(12, 35 - Math.floor(s.score / 3)) === 0) {
            const size = 14 + Math.random() * 20;
            s.obstacles.push({
                x: Math.random() * (this.W - size), y: -size,
                w: size, h: size, dy: s.speed + Math.random() * 1.5,
                color: ["#ef4444","#f59e0b","#ec4899","#f97316"][Math.floor(Math.random() * 4)],
            });
        }

        // Spawn coins
        if (s.frame % 50 === 0) {
            s.coins.push({
                x: 20 + Math.random() * (this.W - 40), y: -10,
                r: 8, dy: s.speed * 0.7,
            });
        }

        // Update obstacles
        s.obstacles = s.obstacles.filter(o => {
            o.y += o.dy;
            // Collision with player
            const px = s.player.x, py = s.player.y, pr = s.player.r;
            if (px + pr > o.x && px - pr < o.x + o.w && py + pr > o.y && py - pr < o.y + o.h) {
                this.gameOver();
                return false;
            }
            return o.y < this.H + 30;
        });

        // Update coins
        s.coins = s.coins.filter(c => {
            c.y += c.dy;
            const dx = s.player.x - c.x, dy = s.player.y - c.y;
            if (Math.sqrt(dx * dx + dy * dy) < s.player.r + c.r) {
                s.score++;
                document.getElementById("dodgeScore").textContent = s.score;
                playSound("audioCorrect", 3.5);
                for (let i = 0; i < 5; i++) {
                    s.particles.push({ x: c.x, y: c.y, dx: (Math.random()-0.5)*4, dy: (Math.random()-0.5)*4, life: 15, color: "#fbbf24" });
                }
                return false;
            }
            return c.y < this.H + 20;
        });

        // Update particles
        s.particles = s.particles.filter(p => { p.x += p.dx; p.y += p.dy; p.life--; return p.life > 0; });
    },

    gameOver() {
        this.state.running = false;
        this.state.over = true;
        cancelAnimationFrame(this.animId);
        if (this.state.score > this.bestScore) {
            this.bestScore = this.state.score;
            localStorage.setItem("dodgeBest", this.bestScore);
            document.getElementById("dodgeBest").textContent = this.bestScore;
        }
        playSound("audioLose");
        const t = i18n[AppState.lang];
        showModal({ type: "lose", icon: "💥", title: t.dodgeLoseTitle, message: t.dodgeLoseMsg.replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
    },

    draw() {
        const ctx = this.ctx, s = this.state;
        ctx.clearRect(0, 0, this.W, this.H);

        // Obstacles
        for (const o of s.obstacles) {
            ctx.fillStyle = o.color;
            ctx.beginPath();
            ctx.roundRect(o.x, o.y, o.w, o.h, 4);
            ctx.fill();
        }

        // Coins
        for (const c of s.coins) {
            ctx.fillStyle = "#fbbf24";
            ctx.shadowColor = "#fbbf24";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#b45309";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("$", c.x, c.y);
        }

        // Particles
        for (const p of s.particles) {
            ctx.globalAlpha = p.life / 15;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Player
        ctx.fillStyle = "#818cf8";
        ctx.shadowColor = "#6366f1";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y, s.player.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("😎", s.player.x, s.player.y);

        // Start hint
        if (!s.running && !s.over) {
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.font = "15px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(i18n[AppState.lang].dodgeTap, this.W / 2, this.H / 2);
        }
    },
};
registerGame("dodge", DodgeGame);
