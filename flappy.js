// ===== Flappy Bird i18n =====
Object.assign(i18n.ar, {
    flappyTitle: "الطائر",
    flappyScore: "النتيجة",
    flappyBest: "أفضل",
    flappyStart: "اضغط للطيران",
    flappyGameOver: "انتهت اللعبة!",
    flappyGameOverMsg: "نتيجتك: {s}",
});
Object.assign(i18n.en, {
    flappyTitle: "Flappy Bird",
    flappyScore: "Score",
    flappyBest: "Best",
    flappyStart: "Tap to fly",
    flappyGameOver: "Game Over!",
    flappyGameOverMsg: "Your score: {s}",
});

const FlappyGame = {
    canvas: null, ctx: null, raf: null,
    W: 300, H: 400,
    state: null, bestScore: 0,
    GRAVITY: 0.35, JUMP: -6, PIPE_W: 50, GAP: 120, PIPE_SPEED: 2,

    onEnter() {
        this.canvas = document.getElementById("flappyCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.bestScore = parseInt(localStorage.getItem("flappyBest") || "0");
        document.getElementById("flappyBest").textContent = this.bestScore;
        this.canvas.addEventListener("click", () => this.tap());
        this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); this.tap(); }, { passive: false });
        this.handleKey = (e) => { if (e.code === "Space") { e.preventDefault(); this.tap(); } };
        document.addEventListener("keydown", this.handleKey);
        this.reset();
    },
    onLeave() { this.stop(); document.removeEventListener("keydown", this.handleKey); },
    onLanguageChange() {},

    reset() {
        this.stop();
        this.state = { bird: { y: this.H / 2, vel: 0 }, pipes: [], score: 0, started: false, over: false, frame: 0 };
        this.draw();
        this.drawOverlay(i18n[AppState.lang].flappyStart);
        document.getElementById("flappyScore").textContent = "0";
    },

    tap() {
        if (this.state.over) return;
        if (!this.state.started) { this.state.started = true; this.loop(); }
        this.state.bird.vel = this.JUMP;
    },

    stop() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } },

    loop() {
        this.update();
        this.draw();
        if (!this.state.over) this.raf = requestAnimationFrame(() => this.loop());
    },

    update() {
        const s = this.state;
        s.frame++;
        s.bird.vel += this.GRAVITY;
        s.bird.y += s.bird.vel;

        // Add pipes
        if (s.frame % 90 === 0) {
            const topH = 40 + Math.random() * (this.H - this.GAP - 80);
            s.pipes.push({ x: this.W, top: topH, scored: false });
        }

        // Move pipes
        s.pipes.forEach(p => { p.x -= this.PIPE_SPEED; });
        s.pipes = s.pipes.filter(p => p.x > -this.PIPE_W);

        // Collision
        const bx = 50, by = s.bird.y, br = 12;
        if (by - br < 0 || by + br > this.H) { this.gameOver(); return; }
        for (const p of s.pipes) {
            if (bx + br > p.x && bx - br < p.x + this.PIPE_W) {
                if (by - br < p.top || by + br > p.top + this.GAP) { this.gameOver(); return; }
            }
            if (!p.scored && p.x + this.PIPE_W < bx) {
                p.scored = true;
                s.score++;
                document.getElementById("flappyScore").textContent = s.score;
                playSound("audioCorrect", 3.5);
            }
        }
    },

    draw() {
        const c = this.ctx, s = this.state;
        // Sky
        c.fillStyle = "#0f172a";
        c.fillRect(0, 0, this.W, this.H);
        // Pipes
        c.fillStyle = "#10b981";
        s.pipes.forEach(p => {
            c.fillRect(p.x, 0, this.PIPE_W, p.top);
            c.fillRect(p.x, p.top + this.GAP, this.PIPE_W, this.H);
            c.fillStyle = "#34d399";
            c.fillRect(p.x - 3, p.top - 16, this.PIPE_W + 6, 16);
            c.fillRect(p.x - 3, p.top + this.GAP, this.PIPE_W + 6, 16);
            c.fillStyle = "#10b981";
        });
        // Bird
        c.fillStyle = "#fbbf24";
        c.beginPath();
        c.arc(50, s.bird.y, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#0f172a";
        c.beginPath();
        c.arc(55, s.bird.y - 3, 3, 0, Math.PI * 2);
        c.fill();
        // Wing
        c.fillStyle = "#f59e0b";
        c.beginPath();
        c.ellipse(42, s.bird.y + 2, 8, 4, 0, 0, Math.PI * 2);
        c.fill();
    },

    drawOverlay(text) {
        const c = this.ctx;
        c.fillStyle = "rgba(15,23,42,0.6)";
        c.fillRect(0, 0, this.W, this.H);
        c.fillStyle = "#f1f5f9";
        c.font = "bold 18px 'Segoe UI', sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(text, this.W / 2, this.H / 2);
    },

    gameOver() {
        this.state.over = true;
        this.stop();
        if (this.state.score > this.bestScore) {
            this.bestScore = this.state.score;
            localStorage.setItem("flappyBest", this.bestScore);
            document.getElementById("flappyBest").textContent = this.bestScore;
        }
        const t = i18n[AppState.lang];
        playSound("audioLose");
        showModal({ type: "lose", icon: "🐦", title: t.flappyGameOver, message: t.flappyGameOverMsg.replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
    },
};
registerGame("flappy", FlappyGame);
