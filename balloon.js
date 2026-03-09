// ===== Balloon Pop i18n =====
Object.assign(i18n.ar, {
    balloonTitle: "فرقع البالونات",
    balloonScore: "النتيجة",
    balloonTime: "الوقت",
    balloonMissed: "فات",
    balloonDoneTitle: "انتهى!",
    balloonDoneMsg: "فرقعت {s} بالون!",
});
Object.assign(i18n.en, {
    balloonTitle: "Balloon Pop",
    balloonScore: "Score",
    balloonTime: "Time",
    balloonMissed: "Missed",
    balloonDoneTitle: "Time's Up!",
    balloonDoneMsg: "You popped {s} balloons!",
});

const BalloonGame = {
    canvas: null, ctx: null, animId: null, state: null,
    W: 380, H: 520,

    COLORS: [
        { fill: "#ef4444", stroke: "#dc2626" },
        { fill: "#f59e0b", stroke: "#d97706" },
        { fill: "#10b981", stroke: "#059669" },
        { fill: "#6366f1", stroke: "#4f46e5" },
        { fill: "#ec4899", stroke: "#db2777" },
        { fill: "#8b5cf6", stroke: "#7c3aed" },
        { fill: "#14b8a6", stroke: "#0d9488" },
    ],
    GAME_TIME: 30,

    onEnter() {
        this.canvas = document.getElementById("balloonCanvas");
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("click", (e) => this.onClick(e));
        this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); this.onTouchClick(e); }, { passive: false });

        this.reset();
    },
    onLeave() { this.stop(); },
    onLanguageChange() {},

    stop() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.animId = null;
        if (this.state && this.state.timer) clearInterval(this.state.timer);
    },

    reset() {
        this.stop();
        this.state = {
            balloons: [], pops: [], score: 0, missed: 0,
            timeLeft: this.GAME_TIME, timer: null, frame: 0, running: true,
        };
        document.getElementById("balloonScore").textContent = "0";
        document.getElementById("balloonTime").textContent = this.GAME_TIME;

        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            document.getElementById("balloonTime").textContent = this.state.timeLeft;
            if (this.state.timeLeft <= 0) this.finish();
        }, 1000);

        this.loop();
    },

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.W;
        const y = ((e.clientY - rect.top) / rect.height) * this.H;
        this.tryPop(x, y);
    },

    onTouchClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * this.W;
        const y = ((touch.clientY - rect.top) / rect.height) * this.H;
        this.tryPop(x, y);
    },

    tryPop(x, y) {
        if (!this.state.running) return;
        for (let i = this.state.balloons.length - 1; i >= 0; i--) {
            const b = this.state.balloons[i];
            const dx = x - b.x, dy = y - b.y;
            if (dx * dx / (b.rx * b.rx) + dy * dy / (b.ry * b.ry) <= 1) {
                // Pop!
                this.state.score += b.points;
                document.getElementById("balloonScore").textContent = this.state.score;
                playSound("audioCorrect", 3.5);

                // Pop particles
                for (let j = 0; j < 8; j++) {
                    this.state.pops.push({
                        x: b.x, y: b.y,
                        dx: (Math.random() - 0.5) * 6,
                        dy: (Math.random() - 0.5) * 6,
                        life: 15,
                        color: b.color.fill,
                        r: 3 + Math.random() * 3,
                    });
                }

                this.state.balloons.splice(i, 1);
                return;
            }
        }
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

        // Spawn balloons
        const spawnRate = Math.max(15, 35 - Math.floor((this.GAME_TIME - s.timeLeft) / 2));
        if (s.frame % spawnRate === 0) {
            const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
            const isSmall = Math.random() < 0.3;
            const rx = isSmall ? 14 + Math.random() * 6 : 20 + Math.random() * 10;
            const ry = rx * 1.3;
            s.balloons.push({
                x: 30 + Math.random() * (this.W - 60),
                y: this.H + ry + 10,
                rx, ry,
                dy: -(1.5 + Math.random() * 2),
                dx: (Math.random() - 0.5) * 0.8,
                wobble: Math.random() * Math.PI * 2,
                color,
                points: isSmall ? 3 : 1,
            });
        }

        // Update balloons
        s.balloons = s.balloons.filter(b => {
            b.y += b.dy;
            b.wobble += 0.04;
            b.x += Math.sin(b.wobble) * 0.5 + b.dx;
            if (b.y + b.ry < -10) {
                s.missed++;
                return false;
            }
            return true;
        });

        // Update pop particles
        s.pops = s.pops.filter(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.dy += 0.2;
            p.life--;
            return p.life > 0;
        });
    },

    draw() {
        const ctx = this.ctx, s = this.state;
        ctx.clearRect(0, 0, this.W, this.H);

        // Balloons
        for (const b of s.balloons) {
            // String
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.ry);
            ctx.lineTo(b.x + Math.sin(b.wobble) * 5, b.y + b.ry + 25);
            ctx.stroke();

            // Balloon body
            ctx.fillStyle = b.color.fill;
            ctx.beginPath();
            ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = b.color.stroke;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Shine
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.beginPath();
            ctx.ellipse(b.x - b.rx * 0.3, b.y - b.ry * 0.3, b.rx * 0.25, b.ry * 0.3, -0.4, 0, Math.PI * 2);
            ctx.fill();

            // Knot
            ctx.fillStyle = b.color.stroke;
            ctx.beginPath();
            ctx.moveTo(b.x - 4, b.y + b.ry);
            ctx.lineTo(b.x, b.y + b.ry + 6);
            ctx.lineTo(b.x + 4, b.y + b.ry);
            ctx.fill();

            // Points label for small balloons
            if (b.points > 1) {
                ctx.fillStyle = "white";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("x" + b.points, b.x, b.y);
            }
        }

        // Pop particles
        for (const p of s.pops) {
            ctx.globalAlpha = p.life / 15;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * (p.life / 15), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },

    finish() {
        this.state.running = false;
        this.stop();
        const t = i18n[AppState.lang];
        playSound("audioWin");
        showModal({
            type: "win", icon: "🎈",
            title: t.balloonDoneTitle,
            message: t.balloonDoneMsg.replace("{s}", this.state.score),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },
};
registerGame("balloon", BalloonGame);
