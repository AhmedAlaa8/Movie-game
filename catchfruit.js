// ===== Catch the Fruit i18n =====
Object.assign(i18n.ar, {
    fruitTitle: "التقط الفواكه",
    fruitScore: "النتيجة",
    fruitLives: "الأرواح",
    fruitTap: "تحرك لالتقاط الفواكه",
    fruitLoseTitle: "انتهت اللعبة!",
    fruitLoseMsg: "جمعت {s} فاكهة!",
});
Object.assign(i18n.en, {
    fruitTitle: "Catch Fruits",
    fruitScore: "Score",
    fruitLives: "Lives",
    fruitTap: "Move to catch fruits",
    fruitLoseTitle: "Game Over!",
    fruitLoseMsg: "You caught {s} fruits!",
});

const CatchFruitGame = {
    canvas: null, ctx: null, animId: null, state: null,
    W: 380, H: 500,

    FRUITS: [
        { emoji: "🍎", points: 1, color: "#ef4444" },
        { emoji: "🍊", points: 1, color: "#f97316" },
        { emoji: "🍋", points: 1, color: "#eab308" },
        { emoji: "🍇", points: 2, color: "#8b5cf6" },
        { emoji: "🍓", points: 2, color: "#ec4899" },
        { emoji: "🍑", points: 2, color: "#fb923c" },
        { emoji: "🌟", points: 5, color: "#fbbf24" },
        { emoji: "💎", points: 10, color: "#6366f1" },
    ],
    BAD: [
        { emoji: "💣", color: "#64748b" },
        { emoji: "🪨", color: "#94a3b8" },
    ],

    onEnter() {
        this.canvas = document.getElementById("fruitCanvas");
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("mousemove", (e) => this.onMove(e));
        this.canvas.addEventListener("touchmove", (e) => { e.preventDefault(); this.onTouch(e); }, { passive: false });
        this.canvas.addEventListener("click", () => { if (this.state && this.state.over) this.reset(); });
        this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); if (this.state && this.state.over) this.reset(); }, { passive: false });
        this.reset();
    },
    onLeave() { if (this.animId) cancelAnimationFrame(this.animId); this.animId = null; },
    onLanguageChange() {},

    onMove(e) {
        if (!this.state) return;
        const rect = this.canvas.getBoundingClientRect();
        this.state.basket.x = ((e.clientX - rect.left) / rect.width) * this.W;
    },
    onTouch(e) {
        if (!this.state) return;
        const rect = this.canvas.getBoundingClientRect();
        this.state.basket.x = ((e.touches[0].clientX - rect.left) / rect.width) * this.W;
    },

    reset() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.state = {
            basket: { x: this.W / 2, y: this.H - 35, w: 70, h: 20 },
            items: [], particles: [],
            score: 0, lives: 5, frame: 0, running: true, over: false,
        };
        document.getElementById("fruitScore").textContent = "0";
        document.getElementById("fruitLives").textContent = "5";
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

        // Spawn items
        const rate = Math.max(18, 40 - Math.floor(s.score / 5));
        if (s.frame % rate === 0) {
            const isBad = Math.random() < 0.2;
            if (isBad) {
                const bad = this.BAD[Math.floor(Math.random() * this.BAD.length)];
                s.items.push({
                    x: 20 + Math.random() * (this.W - 40), y: -20,
                    emoji: bad.emoji, color: bad.color,
                    dy: 2 + Math.random() * 1.5 + s.score * 0.02,
                    points: -1, r: 15,
                });
            } else {
                // Higher value fruits are rarer
                let fruit;
                const roll = Math.random();
                if (roll < 0.03) fruit = this.FRUITS[7]; // diamond
                else if (roll < 0.1) fruit = this.FRUITS[6]; // star
                else if (roll < 0.35) fruit = this.FRUITS[3 + Math.floor(Math.random() * 3)]; // 2pt
                else fruit = this.FRUITS[Math.floor(Math.random() * 3)]; // 1pt

                s.items.push({
                    x: 20 + Math.random() * (this.W - 40), y: -20,
                    emoji: fruit.emoji, color: fruit.color,
                    dy: 1.8 + Math.random() * 1.5 + s.score * 0.02,
                    points: fruit.points, r: 15,
                    wobble: Math.random() * Math.PI * 2,
                });
            }
        }

        // Update items
        const bx = s.basket.x - s.basket.w / 2;
        const by = s.basket.y;
        const bw = s.basket.w;

        s.items = s.items.filter(item => {
            item.y += item.dy;
            if (item.wobble !== undefined) {
                item.wobble += 0.05;
                item.x += Math.sin(item.wobble) * 0.5;
            }

            // Check if caught by basket
            if (item.y + item.r >= by && item.y - item.r <= by + s.basket.h &&
                item.x >= bx && item.x <= bx + bw) {
                if (item.points > 0) {
                    s.score += item.points;
                    document.getElementById("fruitScore").textContent = s.score;
                    playSound("audioCorrect", 3.5);
                    // Sparkle
                    for (let i = 0; i < 5; i++) {
                        s.particles.push({
                            x: item.x, y: item.y,
                            dx: (Math.random() - 0.5) * 5,
                            dy: -(1 + Math.random() * 3),
                            life: 18, color: item.color, r: 3,
                        });
                    }
                } else {
                    // Bad item
                    s.lives--;
                    document.getElementById("fruitLives").textContent = s.lives;
                    playSound("audioWrong");
                    if (s.lives <= 0) { this.gameOver(); }
                }
                return false;
            }

            // Missed good fruit
            if (item.y > this.H + 20) {
                if (item.points > 0) {
                    s.lives--;
                    document.getElementById("fruitLives").textContent = s.lives;
                    if (s.lives <= 0) { this.gameOver(); }
                }
                return false;
            }

            return true;
        });

        // Particles
        s.particles = s.particles.filter(p => {
            p.x += p.dx; p.y += p.dy; p.dy += 0.15; p.life--;
            return p.life > 0;
        });
    },

    gameOver() {
        this.state.running = false;
        this.state.over = true;
        cancelAnimationFrame(this.animId);
        playSound("audioLose");
        const t = i18n[AppState.lang];
        showModal({ type: "lose", icon: "🍎", title: t.fruitLoseTitle, message: t.fruitLoseMsg.replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
    },

    draw() {
        const ctx = this.ctx, s = this.state;
        ctx.clearRect(0, 0, this.W, this.H);

        // Items
        for (const item of s.items) {
            ctx.font = "26px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Glow for special items
            if (item.points >= 5) {
                ctx.shadowColor = item.color;
                ctx.shadowBlur = 12;
            }
            ctx.fillText(item.emoji, item.x, item.y);
            ctx.shadowBlur = 0;
        }

        // Particles
        for (const p of s.particles) {
            ctx.globalAlpha = p.life / 18;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * (p.life / 18), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Basket
        const bx = s.basket.x - s.basket.w / 2;
        const by = s.basket.y;
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.roundRect(bx, by, s.basket.w, s.basket.h, [0, 0, 8, 8]);
        ctx.fill();
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.roundRect(bx - 4, by - 4, s.basket.w + 8, 8, 4);
        ctx.fill();
        // Basket lines
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(bx + (s.basket.w / 4) * i, by);
            ctx.lineTo(bx + (s.basket.w / 4) * i, by + s.basket.h);
            ctx.stroke();
        }

        // Lives as hearts
        ctx.font = "16px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (let i = 0; i < s.lives; i++) {
            ctx.fillText("❤️", 8 + i * 22, 8);
        }

        // Start hint
        if (s.score === 0 && s.running && s.frame < 180) {
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "15px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(i18n[AppState.lang].fruitTap, this.W / 2, this.H / 2);
        }
    },
};
registerGame("catchfruit", CatchFruitGame);
