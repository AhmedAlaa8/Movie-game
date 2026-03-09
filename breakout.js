// ===== Breakout i18n =====
Object.assign(i18n.ar, {
    breakTitle: "كسر الطوب",
    breakScore: "النتيجة",
    breakLives: "الأرواح",
    breakLevel: "المرحلة",
    breakWinTitle: "أحسنت!",
    breakWinMsg: "أنهيت كل المراحل! النتيجة: {s}",
    breakLoseTitle: "خسرت!",
    breakLoseMsg: "المرحلة {l} - النتيجة: {s}",
    breakNextTitle: "ممتاز!",
    breakNextMsg: "المرحلة التالية!",
    breakTap: "اضغط للبدء",
    breakNext: "التالي",
});
Object.assign(i18n.en, {
    breakTitle: "Breakout",
    breakScore: "Score",
    breakLives: "Lives",
    breakLevel: "Level",
    breakWinTitle: "You Win!",
    breakWinMsg: "All levels cleared! Score: {s}",
    breakLoseTitle: "Game Over",
    breakLoseMsg: "Level {l} - Score: {s}",
    breakNextTitle: "Great!",
    breakNextMsg: "Next level!",
    breakTap: "Tap to start",
    breakNext: "Next",
});

const BreakoutGame = {
    canvas: null,
    ctx: null,
    animId: null,
    state: null,
    W: 400,
    H: 500,

    // Power-up types
    POWERUPS: [
        { type: "wide",   emoji: "↔️", color: "#6366f1" },  // wider paddle
        { type: "life",   emoji: "❤️", color: "#ef4444" },  // extra life
        { type: "slow",   emoji: "🐢", color: "#10b981" },  // slow ball
        { type: "multi",  emoji: "⚡", color: "#f59e0b" },  // multi ball
        { type: "fire",   emoji: "🔥", color: "#ec4899" },  // fire ball (pierces)
    ],

    // Level patterns - 1 = brick, 0 = empty, 2 = strong (2 hits)
    LEVELS: [
        // Level 1 - Classic rows
        {
            pattern: [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
            ],
            colors: ["#ef4444","#f59e0b","#10b981","#6366f1","#ec4899"],
        },
        // Level 2 - Diamond
        {
            pattern: [
                [0,0,0,1,1,0,0,0],
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,0,0],
                [0,0,0,1,1,0,0,0],
            ],
            colors: ["#818cf8","#6366f1","#a78bfa","#c084fc","#e879f9","#f472b6","#fb7185"],
        },
        // Level 3 - Checkerboard
        {
            pattern: [
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
                [1,0,1,0,1,0,1,0],
                [0,1,0,1,0,1,0,1],
            ],
            colors: ["#ef4444","#f59e0b","#ef4444","#f59e0b","#ef4444","#f59e0b"],
        },
        // Level 4 - Heart
        {
            pattern: [
                [0,1,1,0,0,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,0,0],
                [0,0,0,1,1,0,0,0],
            ],
            colors: ["#ef4444","#f87171","#ef4444","#dc2626","#ef4444","#f87171","#dc2626"],
        },
        // Level 5 - Fortress with strong bricks
        {
            pattern: [
                [2,2,2,2,2,2,2,2],
                [2,0,0,0,0,0,0,2],
                [2,0,1,1,1,1,0,2],
                [2,0,1,0,0,1,0,2],
                [2,0,1,1,1,1,0,2],
                [2,0,0,0,0,0,0,2],
                [2,2,2,2,2,2,2,2],
            ],
            colors: ["#f59e0b","#fbbf24","#10b981","#34d399","#6366f1","#818cf8","#f59e0b"],
        },
        // Level 6 - Invader
        {
            pattern: [
                [0,0,1,0,0,0,1,0],
                [0,0,0,1,0,1,0,0],
                [0,0,1,1,1,1,1,0],
                [0,1,1,0,1,0,1,1],
                [1,1,1,1,1,1,1,1],
                [1,0,1,1,1,1,0,1],
                [1,0,1,0,0,1,0,1],
                [0,0,0,1,1,0,0,0],
            ],
            colors: ["#10b981","#10b981","#34d399","#6366f1","#818cf8","#34d399","#10b981","#10b981"],
        },
    ],

    onEnter() {
        this.canvas = document.getElementById("breakoutCanvas");
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("mousemove", (e) => this.onMove(e));
        this.canvas.addEventListener("touchmove", (e) => { e.preventDefault(); this.onTouch(e); }, { passive: false });
        this.canvas.addEventListener("click", () => { if (this.state && !this.state.running) this.launch(); });
        this.canvas.addEventListener("touchstart", (e) => { e.preventDefault(); if (this.state && !this.state.running) this.launch(); }, { passive: false });

        this.reset();
    },

    onLeave() {
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
    },
    onLanguageChange() { this.draw(); },

    onMove(e) {
        if (!this.state) return;
        const rect = this.canvas.getBoundingClientRect();
        this.state.paddle.x = ((e.clientX - rect.left) / rect.width) * this.W - this.state.paddle.w / 2;
        this.clampPaddle();
    },

    onTouch(e) {
        if (!this.state) return;
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.state.paddle.x = ((touch.clientX - rect.left) / rect.width) * this.W - this.state.paddle.w / 2;
        this.clampPaddle();
    },

    clampPaddle() {
        const p = this.state.paddle;
        if (p.x < 0) p.x = 0;
        if (p.x + p.w > this.W) p.x = this.W - p.w;
    },

    buildBricks(levelIdx) {
        const level = this.LEVELS[levelIdx % this.LEVELS.length];
        const bricks = [];
        const rows = level.pattern.length;
        const cols = level.pattern[0].length;
        const bw = 44, bh = 16, gap = 3;
        const totalW = cols * (bw + gap) - gap;
        const offsetX = (this.W - totalW) / 2;
        const offsetY = 35;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = level.pattern[r][c];
                if (val === 0) continue;
                bricks.push({
                    x: offsetX + c * (bw + gap),
                    y: offsetY + r * (bh + gap),
                    w: bw, h: bh,
                    color: level.colors[r % level.colors.length],
                    alive: true,
                    hp: val,           // 1 = normal, 2 = strong
                    maxHp: val,
                });
            }
        }
        return bricks;
    },

    reset() {
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
        this.state = {
            paddle: { x: this.W / 2 - 40, y: this.H - 30, w: 80, h: 12 },
            balls: [{ x: this.W / 2, y: this.H - 45, r: 7, dx: 0, dy: 0 }],
            bricks: this.buildBricks(0),
            powerups: [],
            particles: [],
            score: 0,
            lives: 3,
            level: 1,
            running: false,
            over: false,
            fireBall: false,
            fireTimer: 0,
            wideTimer: 0,
        };
        document.getElementById("breakScore").textContent = "0";
        document.getElementById("breakLives").textContent = "3";
        document.getElementById("breakLevel").textContent = "1";
        this.draw();
    },

    nextLevel() {
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
        this.state.level++;
        document.getElementById("breakLevel").textContent = this.state.level;

        if (this.state.level > this.LEVELS.length) {
            this.gameOver(true);
            return;
        }

        this.state.bricks = this.buildBricks(this.state.level - 1);
        this.state.powerups = [];
        this.state.particles = [];
        this.state.fireBall = false;
        this.state.fireTimer = 0;
        this.state.paddle.w = 80;
        this.state.wideTimer = 0;
        this.state.balls = [{ x: this.W / 2, y: this.H - 45, r: 7, dx: 0, dy: 0 }];
        this.state.running = false;
        this.state.over = false;
        this.draw();
    },

    launch() {
        if (this.state.over) { this.reset(); return; }
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        const speed = 4 + this.state.level * 0.3;
        this.state.balls[0].dx = Math.cos(angle) * speed;
        this.state.balls[0].dy = Math.sin(angle) * speed;
        this.state.running = true;
        this.loop();
    },

    loop() {
        if (!this.state.running) return;
        this.update();
        this.draw();
        this.animId = requestAnimationFrame(() => this.loop());
    },

    spawnPowerup(x, y) {
        if (Math.random() > 0.25) return; // 25% chance
        const pu = this.POWERUPS[Math.floor(Math.random() * this.POWERUPS.length)];
        this.state.powerups.push({ x, y, type: pu.type, emoji: pu.emoji, color: pu.color, dy: 2 });
    },

    spawnParticles(x, y, color) {
        for (let i = 0; i < 6; i++) {
            this.state.particles.push({
                x, y,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                life: 20 + Math.random() * 15,
                color,
                r: 2 + Math.random() * 2,
            });
        }
    },

    applyPowerup(type) {
        const s = this.state;
        switch (type) {
            case "wide":
                s.paddle.w = 130;
                s.wideTimer = 600; // ~10 seconds
                break;
            case "life":
                s.lives++;
                document.getElementById("breakLives").textContent = s.lives;
                break;
            case "slow":
                s.balls.forEach(b => {
                    const spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                    if (spd > 2) {
                        b.dx *= 0.6;
                        b.dy *= 0.6;
                    }
                });
                break;
            case "multi":
                const orig = s.balls[0];
                if (orig && s.balls.length < 5) {
                    s.balls.push({ x: orig.x, y: orig.y, r: orig.r, dx: -orig.dx, dy: orig.dy });
                    s.balls.push({ x: orig.x, y: orig.y, r: orig.r, dx: orig.dx * 0.5, dy: -Math.abs(orig.dy) });
                }
                break;
            case "fire":
                s.fireBall = true;
                s.fireTimer = 480; // ~8 seconds
                break;
        }
    },

    update() {
        const s = this.state;
        const p = s.paddle;

        // Timers
        if (s.wideTimer > 0) {
            s.wideTimer--;
            if (s.wideTimer <= 0) s.paddle.w = 80;
        }
        if (s.fireTimer > 0) {
            s.fireTimer--;
            if (s.fireTimer <= 0) s.fireBall = false;
        }

        // Update particles
        s.particles = s.particles.filter(pt => {
            pt.x += pt.dx;
            pt.y += pt.dy;
            pt.life--;
            pt.r *= 0.97;
            return pt.life > 0;
        });

        // Update powerups
        s.powerups = s.powerups.filter(pu => {
            pu.y += pu.dy;
            // Catch with paddle
            if (pu.y >= p.y && pu.y <= p.y + p.h + 10 && pu.x >= p.x && pu.x <= p.x + p.w) {
                this.applyPowerup(pu.type);
                playSound("audioCorrect", 2);
                return false;
            }
            return pu.y < this.H + 20;
        });

        // Update all balls
        const deadBalls = [];
        for (let bi = 0; bi < s.balls.length; bi++) {
            const b = s.balls[bi];
            b.x += b.dx;
            b.y += b.dy;

            // Wall bounce
            if (b.x - b.r <= 0) { b.x = b.r; b.dx = Math.abs(b.dx); }
            if (b.x + b.r >= this.W) { b.x = this.W - b.r; b.dx = -Math.abs(b.dx); }
            if (b.y - b.r <= 0) { b.y = b.r; b.dy = Math.abs(b.dy); }

            // Bottom
            if (b.y + b.r >= this.H) {
                deadBalls.push(bi);
                continue;
            }

            // Paddle bounce
            if (b.y + b.r >= p.y && b.y + b.r <= p.y + p.h + 5 && b.x >= p.x - 2 && b.x <= p.x + p.w + 2) {
                b.dy = -Math.abs(b.dy);
                const hit = (b.x - p.x) / p.w;
                b.dx = (hit - 0.5) * 8;
                b.y = p.y - b.r - 1;
            }

            // Brick collision
            for (const brick of s.bricks) {
                if (!brick.alive) continue;
                if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w &&
                    b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {

                    brick.hp--;
                    if (brick.hp <= 0) {
                        brick.alive = false;
                        s.score += brick.maxHp * 10;
                        document.getElementById("breakScore").textContent = s.score;
                        this.spawnPowerup(brick.x + brick.w / 2, brick.y + brick.h / 2);
                        this.spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
                    } else {
                        s.score += 5;
                        document.getElementById("breakScore").textContent = s.score;
                        this.spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
                    }

                    if (!s.fireBall) {
                        b.dy = -b.dy;
                    }
                    // Fire ball pierces through
                    break;
                }
            }
        }

        // Remove dead balls
        for (let i = deadBalls.length - 1; i >= 0; i--) {
            s.balls.splice(deadBalls[i], 1);
        }

        // All balls lost
        if (s.balls.length === 0) {
            s.lives--;
            document.getElementById("breakLives").textContent = s.lives;
            playSound("audioWrong");
            s.fireBall = false;
            s.fireTimer = 0;
            s.paddle.w = 80;
            s.wideTimer = 0;

            if (s.lives <= 0) {
                this.gameOver(false);
                return;
            }
            s.balls = [{ x: p.x + p.w / 2, y: p.y - 9, r: 7, dx: 0, dy: 0 }];
            s.running = false;
            cancelAnimationFrame(this.animId);
            this.draw();
            return;
        }

        // Check level clear
        if (s.bricks.every(br => !br.alive)) {
            s.running = false;
            cancelAnimationFrame(this.animId);
            playSound("audioWin");
            if (s.level >= this.LEVELS.length) {
                this.gameOver(true);
            } else {
                const t = i18n[AppState.lang];
                showModal({ type: "win", icon: "⭐", title: t.breakNextTitle, message: t.breakNextMsg, buttonText: t.breakNext, onButton: () => this.nextLevel() });
            }
        }
    },

    gameOver(won) {
        this.state.running = false;
        this.state.over = true;
        cancelAnimationFrame(this.animId);
        const t = i18n[AppState.lang];
        if (won) {
            playSound("audioWin");
            showModal({ type: "win", icon: "🏆", title: t.breakWinTitle, message: t.breakWinMsg.replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
        } else {
            playSound("audioLose");
            showModal({ type: "lose", icon: "💔", title: t.breakLoseTitle, message: t.breakLoseMsg.replace("{l}", this.state.level).replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
        }
    },

    draw() {
        const ctx = this.ctx;
        const s = this.state;
        ctx.clearRect(0, 0, this.W, this.H);

        // Bricks
        for (const brick of s.bricks) {
            if (!brick.alive) continue;
            // Darken if strong brick with remaining hp
            const alpha = brick.hp === 2 ? 1 : 0.85;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = brick.color;
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
            ctx.fill();

            // Strong brick border
            if (brick.maxHp === 2) {
                ctx.strokeStyle = "rgba(255,255,255,0.5)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
                ctx.stroke();
            }

            // Shine
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.fillRect(brick.x + 2, brick.y + 1, brick.w - 4, brick.h / 3);
            ctx.globalAlpha = 1;
        }

        // Particles
        for (const pt of s.particles) {
            ctx.globalAlpha = pt.life / 30;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Powerups
        for (const pu of s.powerups) {
            // Glow
            ctx.shadowColor = pu.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = pu.color;
            ctx.beginPath();
            ctx.arc(pu.x, pu.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Emoji
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(pu.emoji, pu.x, pu.y);
        }

        // Paddle
        const gradient = ctx.createLinearGradient(s.paddle.x, s.paddle.y, s.paddle.x + s.paddle.w, s.paddle.y);
        gradient.addColorStop(0, s.fireBall ? "#ef4444" : "#6366f1");
        gradient.addColorStop(1, s.fireBall ? "#f59e0b" : "#818cf8");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(s.paddle.x, s.paddle.y, s.paddle.w, s.paddle.h, 6);
        ctx.fill();

        // Balls
        for (const b of s.balls) {
            if (s.fireBall) {
                ctx.shadowColor = "#ef4444";
                ctx.shadowBlur = 12;
                ctx.fillStyle = "#f59e0b";
            } else {
                ctx.fillStyle = "#f1f5f9";
                ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Start hint
        if (!s.running && !s.over) {
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(i18n[AppState.lang].breakTap, this.W / 2, this.H / 2 + 40);
        }
    },
};
registerGame("breakout", BreakoutGame);
