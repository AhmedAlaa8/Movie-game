// ===== 2048 i18n =====
Object.assign(i18n.ar, {
    g2048Title: "2048",
    g2048Score: "النتيجة",
    g2048Best: "أفضل",
    g2048GameOver: "انتهت اللعبة!",
    g2048GameOverMsg: "نتيجتك: {s}",
    g2048WinTitle: "مبروك!",
    g2048WinMsg: "وصلت إلى 2048!",
    g2048Controls: "استخدم الأسهم أو اسحب",
});
Object.assign(i18n.en, {
    g2048Title: "2048",
    g2048Score: "Score",
    g2048Best: "Best",
    g2048GameOver: "Game Over!",
    g2048GameOverMsg: "Your score: {s}",
    g2048WinTitle: "You Win!",
    g2048WinMsg: "You reached 2048!",
    g2048Controls: "Use arrows or swipe",
});

const Game2048 = {
    state: null,
    SIZE: 4,
    bestScore: 0,

    onEnter() {
        this.bestScore = parseInt(localStorage.getItem("2048best") || "0");
        document.getElementById("g2048Best").textContent = this.bestScore;
        this.handleKey = (e) => {
            const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
            if (map[e.key]) { e.preventDefault(); this.move(map[e.key]); }
        };
        document.addEventListener("keydown", this.handleKey);
        this.setupTouch();
        this.reset();
    },
    onLeave() { document.removeEventListener("keydown", this.handleKey); },
    onLanguageChange() {},

    setupTouch() {
        const el = document.getElementById("g2048Board");
        let start = null;
        el.addEventListener("touchstart", (e) => { start = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
        el.addEventListener("touchend", (e) => {
            if (!start) return;
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
            if (Math.abs(dx) > Math.abs(dy)) this.move(dx > 0 ? "right" : "left");
            else this.move(dy > 0 ? "down" : "up");
        }, { passive: true });
    },

    reset() {
        this.state = { grid: Array.from({ length: 4 }, () => [0, 0, 0, 0]), score: 0, won: false, over: false };
        this.addRandom();
        this.addRandom();
        this.render();
        document.getElementById("g2048Score").textContent = "0";
    },

    addRandom() {
        const empty = [];
        this.state.grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
        if (!empty.length) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        this.state.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    },

    move(dir) {
        if (this.state.over) return;
        const g = this.state.grid;
        let moved = false;
        const rotated = (d, fn) => {
            let m = g.map(r => [...r]);
            if (d === "up" || d === "down") { m = this.transpose(m); }
            if (d === "right" || d === "down") { m = m.map(r => r.reverse()); }
            const res = fn(m);
            if (d === "right" || d === "down") { res.g = res.g.map(r => r.reverse()); }
            if (d === "up" || d === "down") { res.g = this.transpose(res.g); }
            return res;
        };
        const result = rotated(dir, (m) => {
            let mv = false, sc = 0;
            const ng = m.map(row => {
                let filtered = row.filter(v => v);
                for (let i = 0; i < filtered.length - 1; i++) {
                    if (filtered[i] === filtered[i + 1]) {
                        filtered[i] *= 2;
                        sc += filtered[i];
                        filtered.splice(i + 1, 1);
                    }
                }
                const nr = [...filtered, ...Array(4 - filtered.length).fill(0)];
                if (nr.join(",") !== row.join(",")) mv = true;
                return nr;
            });
            return { g: ng, moved: mv, score: sc };
        });
        if (result.moved) {
            this.state.grid = result.g;
            this.state.score += result.score;
            this.addRandom();
            playSound("audioCorrect", 3.5);
            if (this.state.score > this.bestScore) {
                this.bestScore = this.state.score;
                localStorage.setItem("2048best", this.bestScore);
                document.getElementById("g2048Best").textContent = this.bestScore;
            }
            document.getElementById("g2048Score").textContent = this.state.score;
            this.render();
            if (!this.state.won && this.state.grid.some(r => r.some(v => v >= 2048))) {
                this.state.won = true;
                const t = i18n[AppState.lang];
                playSound("audioWin");
                showModal({ type: "win", icon: "🎉", title: t.g2048WinTitle, message: t.g2048WinMsg, buttonText: t.playAgain, onButton: () => this.reset() });
            }
            if (this.isGameOver()) {
                this.state.over = true;
                const t = i18n[AppState.lang];
                playSound("audioLose");
                showModal({ type: "lose", icon: "😞", title: t.g2048GameOver, message: t.g2048GameOverMsg.replace("{s}", this.state.score), buttonText: t.playAgain, onButton: () => this.reset() });
            }
        }
    },

    transpose(m) { return m[0].map((_, i) => m.map(r => r[i])); },

    isGameOver() {
        const g = this.state.grid;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
            if (!g[r][c]) return false;
            if (c < 3 && g[r][c] === g[r][c + 1]) return false;
            if (r < 3 && g[r][c] === g[r + 1][c]) return false;
        }
        return true;
    },

    render() {
        const board = document.getElementById("g2048Board");
        board.innerHTML = "";
        this.state.grid.forEach(row => {
            row.forEach(val => {
                const tile = document.createElement("div");
                tile.className = "g2048-tile" + (val ? " g2048-t" + Math.min(val, 8192) : "");
                tile.textContent = val || "";
                board.appendChild(tile);
            });
        });
    },
};
registerGame("game2048", Game2048);
