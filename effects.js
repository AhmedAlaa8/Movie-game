// ===== Sound Effects System (Web Audio API - no files needed) =====
const SFX = {
    ctx: null,

    init() {
        if (this.ctx) return;
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    },

    // Unlock audio on first user interaction
    unlock() {
        this.init();
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    },

    tone(freq, duration, type = "sine", vol = 0.3) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start();
        o.stop(this.ctx.currentTime + duration);
    },

    // --- Sound Effects ---
    click() {
        this.tone(800, 0.08, "sine", 0.15);
    },

    pop() {
        this.tone(600, 0.06, "sine", 0.2);
        setTimeout(() => this.tone(900, 0.05, "sine", 0.1), 30);
    },

    hit() {
        this.tone(300, 0.1, "square", 0.15);
    },

    swoosh() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(400, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime + 0.15);
    },

    coin() {
        this.tone(988, 0.08, "sine", 0.2);
        setTimeout(() => this.tone(1319, 0.12, "sine", 0.15), 80);
    },

    combo(level) {
        const base = 523 + level * 80;
        this.tone(base, 0.07, "sine", 0.15);
        setTimeout(() => this.tone(base * 1.25, 0.07, "sine", 0.12), 60);
        setTimeout(() => this.tone(base * 1.5, 0.1, "sine", 0.1), 120);
    },

    powerup() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this.tone(f, 0.12, "sine", 0.15), i * 60);
        });
    },

    countdown(n) {
        this.tone(n <= 1 ? 880 : 440, 0.15, "square", 0.12);
    },

    levelUp() {
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
            setTimeout(() => this.tone(f, 0.15, "sine", 0.2 - i * 0.03), i * 80);
        });
    },

    explosion() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const source = this.ctx.createBufferSource();
        const g = this.ctx.createGain();
        source.buffer = buffer;
        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        source.connect(g); g.connect(this.ctx.destination);
        source.start();
    },

    bounce() {
        this.tone(220, 0.06, "triangle", 0.15);
        setTimeout(() => this.tone(330, 0.04, "triangle", 0.1), 40);
    },

    drop() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(800, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
        g.gain.setValueAtTime(0.15, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime + 0.25);
    },

    tick() {
        this.tone(1000, 0.03, "sine", 0.08);
    },
};

// ===== Vibration Helper =====
function vibrate(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// ===== Score Popup System =====
function showScorePopup(text, x, y, color = "#fbbf24") {
    const popup = document.createElement("div");
    popup.className = "score-popup";
    popup.textContent = text;
    popup.style.cssText = `left:${x}px;top:${y}px;color:${color};`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

// ===== Confetti System =====
const Confetti = {
    canvas: null, ctx: null, particles: [], animId: null,

    burst(x, y, count = 40) {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
            this.canvas.className = "confetti-canvas";
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");
            window.addEventListener("resize", () => {
                if (this.canvas) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }
            });
        }

        const colors = ["#ef4444","#f59e0b","#10b981","#6366f1","#ec4899","#8b5cf6","#fbbf24","#14b8a6"];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 4 + Math.random() * 8;
            this.particles.push({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 3,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed - 3,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                life: 80 + Math.random() * 40,
                gravity: 0.12,
            });
        }

        if (!this.animId) this.loop();
    },

    loop() {
        if (this.particles.length === 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.dy += p.gravity;
            p.dx *= 0.99;
            p.rotation += p.rotSpeed;
            p.life--;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.min(1, p.life / 30);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            this.ctx.restore();

            return p.life > 0;
        });

        this.ctx.globalAlpha = 1;
        this.animId = requestAnimationFrame(() => this.loop());
    },
};

// ===== Enhanced Modal with confetti and sounds =====
const _originalShowModal = showModal;
showModal = function(config) {
    SFX.unlock();
    if (config.type === "win") {
        setTimeout(() => Confetti.burst(), 200);
        setTimeout(() => SFX.levelUp(), 100);
        vibrate([50, 30, 50, 30, 100]);
    } else if (config.type === "lose") {
        SFX.drop();
        vibrate([200]);
    }
    _originalShowModal(config);
};

// ===== Enhanced playSound with SFX fallback =====
const _originalPlaySound = playSound;
playSound = function(audioId, rate = 1) {
    SFX.unlock();
    // Play Web Audio SFX as enhancement
    switch(audioId) {
        case "audioCorrect": SFX.pop(); vibrate(30); break;
        case "audioWrong": SFX.hit(); vibrate([50, 20, 50]); break;
        case "audioWin": vibrate([50, 30, 50, 30, 100]); break;
        case "audioLose": SFX.explosion(); vibrate([200]); break;
    }
    // Also play original audio file
    _originalPlaySound(audioId, rate);
};

// ===== Menu card click sound =====
document.addEventListener("DOMContentLoaded", () => {
    // Unlock audio on first touch/click
    const unlockHandler = () => { SFX.unlock(); document.removeEventListener("click", unlockHandler); document.removeEventListener("touchstart", unlockHandler); };
    document.addEventListener("click", unlockHandler);
    document.addEventListener("touchstart", unlockHandler);

    // Menu card sounds
    document.querySelectorAll(".menu-card").forEach(card => {
        card.addEventListener("click", () => { SFX.swoosh(); vibrate(20); });
    });

    // Back button sounds
    document.querySelectorAll(".btn-back").forEach(btn => {
        btn.addEventListener("click", () => { SFX.click(); });
    });

    // Lang toggle sound
    document.querySelectorAll(".lang-toggle").forEach(btn => {
        btn.addEventListener("click", () => { SFX.tick(); });
    });

    // Modal button sound
    const modalBtn = document.getElementById("modalBtn");
    if (modalBtn) {
        modalBtn.addEventListener("click", () => { SFX.swoosh(); vibrate(20); });
    }
});
