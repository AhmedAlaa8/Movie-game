// ===== Whack-a-Mole i18n =====
Object.assign(i18n.ar, {
    whackTitle: "اضرب الخلد",
    whackScore: "النتيجة",
    whackTime: "الوقت",
    whackStart: "ابدأ!",
    whackDoneTitle: "انتهى الوقت!",
    whackDoneMsg: "نتيجتك: {s} ضربة | كومبو: x{c}",
    whackMissed: "الفائت",
    whackCombo: "كومبو",
});
Object.assign(i18n.en, {
    whackTitle: "Whack-a-Mole",
    whackScore: "Score",
    whackTime: "Time",
    whackStart: "Start!",
    whackDoneTitle: "Time's Up!",
    whackDoneMsg: "Your score: {s} hits | Best combo: x{c}",
    whackMissed: "Missed",
    whackCombo: "Combo",
});

const WhackMoleGame = {
    state: null,
    GAME_TIME: 30,
    HOLES: 9,
    MOLES: ["🐹", "🐭", "🐰", "🦊", "🐻"],
    BAD_MOLES: ["💣", "💀"],

    onEnter() {
        document.getElementById("whackStartBtn").onclick = () => this.start();
        this.reset();
    },
    onLeave() { this.stop(); },
    onLanguageChange() {},

    reset() {
        this.stop();
        this.state = {
            score: 0, combo: 0, bestCombo: 0, timeLeft: this.GAME_TIME,
            timer: null, moleTimers: [], running: false,
            holes: Array(this.HOLES).fill(null), // null = empty, or { emoji, isBad }
        };
        document.getElementById("whackScoreVal").textContent = "0";
        document.getElementById("whackTimeLeft").textContent = this.GAME_TIME;
        document.getElementById("whackCombo").textContent = "0";
        document.getElementById("whackStartBtn").style.display = "inline-flex";
        this.renderBoard();
    },

    stop() {
        if (this.state) {
            if (this.state.timer) clearInterval(this.state.timer);
            this.state.moleTimers.forEach(t => clearTimeout(t));
            this.state.moleTimers = [];
            this.state.timer = null;
        }
    },

    renderBoard() {
        const board = document.getElementById("whackBoard");
        board.innerHTML = "";
        for (let i = 0; i < this.HOLES; i++) {
            const hole = document.createElement("div");
            hole.className = "whack-hole";
            hole.id = "whackHole" + i;

            const mole = document.createElement("div");
            mole.className = "whack-mole";
            mole.id = "whackMole" + i;

            hole.appendChild(mole);
            hole.addEventListener("click", () => this.hitMole(i));
            board.appendChild(hole);
        }
    },

    start() {
        this.reset();
        this.state.running = true;
        document.getElementById("whackStartBtn").style.display = "none";

        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            document.getElementById("whackTimeLeft").textContent = this.state.timeLeft;
            if (this.state.timeLeft <= 0) this.finish();
        }, 1000);

        this.spawnLoop();
    },

    getSpeed() {
        const elapsed = this.GAME_TIME - this.state.timeLeft;
        // Start: 800ms, End: 350ms
        return Math.max(350, 800 - elapsed * 18);
    },

    getShowTime() {
        const elapsed = this.GAME_TIME - this.state.timeLeft;
        // Start: 900ms visible, End: 400ms visible
        return Math.max(400, 900 - elapsed * 20);
    },

    spawnLoop() {
        if (!this.state.running) return;

        this.spawnMole();

        // Occasionally spawn 2 at once after 8 seconds
        const elapsed = this.GAME_TIME - this.state.timeLeft;
        if (elapsed > 8 && Math.random() < 0.4) {
            setTimeout(() => { if (this.state.running) this.spawnMole(); }, 100);
        }
        // Even 3 at once after 20 seconds
        if (elapsed > 20 && Math.random() < 0.25) {
            setTimeout(() => { if (this.state.running) this.spawnMole(); }, 200);
        }

        const tid = setTimeout(() => this.spawnLoop(), this.getSpeed());
        this.state.moleTimers.push(tid);
    },

    spawnMole() {
        if (!this.state.running) return;

        // Find empty holes
        const empties = [];
        for (let i = 0; i < this.HOLES; i++) {
            if (!this.state.holes[i]) empties.push(i);
        }
        if (empties.length === 0) return;

        const idx = empties[Math.floor(Math.random() * empties.length)];

        // 15% chance of bomb
        const isBad = Math.random() < 0.15;
        const emoji = isBad
            ? this.BAD_MOLES[Math.floor(Math.random() * this.BAD_MOLES.length)]
            : this.MOLES[Math.floor(Math.random() * this.MOLES.length)];

        this.state.holes[idx] = { emoji, isBad };

        const hole = document.getElementById("whackHole" + idx);
        const mole = document.getElementById("whackMole" + idx);
        if (hole && mole) {
            mole.textContent = emoji;
            hole.classList.add("whack-active");
            if (isBad) hole.classList.add("whack-bad");
        }

        // Auto-hide after showTime
        const showTime = this.getShowTime();
        const tid = setTimeout(() => {
            if (this.state.holes[idx]) {
                this.hideMole(idx, true);
            }
        }, showTime);
        this.state.moleTimers.push(tid);
    },

    hideMole(idx, missed) {
        const hole = document.getElementById("whackHole" + idx);
        if (hole) {
            hole.classList.remove("whack-active", "whack-bad");
        }
        if (missed && this.state.holes[idx] && !this.state.holes[idx].isBad) {
            this.state.combo = 0;
            document.getElementById("whackCombo").textContent = "0";
        }
        this.state.holes[idx] = null;
    },

    hitMole(idx) {
        if (!this.state.running) return;
        if (!this.state.holes[idx]) return;

        const moleData = this.state.holes[idx];
        const hole = document.getElementById("whackHole" + idx);

        if (moleData.isBad) {
            // Hit a bomb! Lose points
            this.state.score = Math.max(0, this.state.score - 3);
            this.state.combo = 0;
            document.getElementById("whackScoreVal").textContent = this.state.score;
            document.getElementById("whackCombo").textContent = "0";
            playSound("audioWrong");
            if (hole) {
                hole.classList.remove("whack-active", "whack-bad");
                hole.classList.add("whack-bomb-hit");
                setTimeout(() => hole.classList.remove("whack-bomb-hit"), 400);
            }
        } else {
            // Good hit!
            this.state.combo++;
            const comboBonus = this.state.combo >= 3 ? Math.floor(this.state.combo / 3) : 0;
            this.state.score += 1 + comboBonus;
            if (this.state.combo > this.state.bestCombo) this.state.bestCombo = this.state.combo;
            document.getElementById("whackScoreVal").textContent = this.state.score;
            document.getElementById("whackCombo").textContent = this.state.combo;
            playSound("audioCorrect", 3.5);
            if (hole) {
                hole.classList.remove("whack-active");
                hole.classList.add("whack-hit");
                setTimeout(() => hole.classList.remove("whack-hit"), 200);
            }
        }

        this.state.holes[idx] = null;
    },

    finish() {
        this.state.running = false;
        this.stop();
        // Clear all active moles
        for (let i = 0; i < this.HOLES; i++) {
            const hole = document.getElementById("whackHole" + i);
            if (hole) hole.classList.remove("whack-active", "whack-bad");
            this.state.holes[i] = null;
        }
        const t = i18n[AppState.lang];
        playSound("audioWin");
        showModal({
            type: "win",
            icon: "🐹",
            title: t.whackDoneTitle,
            message: t.whackDoneMsg.replace("{s}", this.state.score).replace("{c}", this.state.bestCombo),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },
};
registerGame("whackmole", WhackMoleGame);
