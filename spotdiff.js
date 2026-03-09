// ===== Spot the Difference i18n =====
Object.assign(i18n.ar, {
    spotTitle: "اوجد الاختلاف",
    spotFound: "وجدت",
    spotTime: "الوقت",
    spotHint: "اضغط على الرمز المختلف",
    spotWinTitle: "ممتاز!",
    spotWinMsg: "وجدت كل الاختلافات في {t} ثانية!",
    spotRound: "الجولة",
});
Object.assign(i18n.en, {
    spotTitle: "Spot the Odd",
    spotFound: "Found",
    spotTime: "Time",
    spotHint: "Tap the different emoji",
    spotWinTitle: "Great!",
    spotWinMsg: "Found all in {t} seconds!",
    spotRound: "Round",
});

const SpotDiffGame = {
    state: null,
    TOTAL_ROUNDS: 10,

    EMOJI_PAIRS: [
        ["😀","😃"],["🐶","🐕"],["🍎","🍏"],["🔴","🟠"],["⭐","🌟"],
        ["🎵","🎶"],["💙","💜"],["🌞","🌝"],["🐱","🐈"],["🏀","🏐"],
        ["🍕","🍔"],["🚗","🚙"],["✏️","🖊️"],["🌸","🌺"],["👟","👞"],
        ["🎂","🧁"],["🐟","🐠"],["📱","📲"],["🎁","🎀"],["🌍","🌎"],
    ],

    onEnter() { this.reset(); },
    onLeave() { this.stopTimer(); },
    onLanguageChange() {},

    reset() {
        this.stopTimer();
        this.state = { round: 0, found: 0, timer: null, startTime: 0, elapsed: 0 };
        document.getElementById("spotFound").textContent = "0";
        document.getElementById("spotRound").textContent = "1";
        document.getElementById("spotTime").textContent = "0";
        this.nextRound();
        this.state.startTime = Date.now();
        this.state.timer = setInterval(() => {
            this.state.elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
            document.getElementById("spotTime").textContent = this.state.elapsed;
        }, 500);
    },

    stopTimer() {
        if (this.state && this.state.timer) { clearInterval(this.state.timer); this.state.timer = null; }
    },

    nextRound() {
        const pair = this.EMOJI_PAIRS[Math.floor(Math.random() * this.EMOJI_PAIRS.length)];
        const base = pair[0];
        const odd = pair[1];

        // Grid size increases with rounds
        const gridSize = Math.min(6, 3 + Math.floor(this.state.round / 3));
        const total = gridSize * gridSize;
        const oddIdx = Math.floor(Math.random() * total);

        const grid = document.getElementById("spotGrid");
        grid.innerHTML = "";
        grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        for (let i = 0; i < total; i++) {
            const cell = document.createElement("button");
            cell.className = "spot-cell";
            cell.textContent = i === oddIdx ? odd : base;
            cell.addEventListener("click", () => this.handleClick(i === oddIdx, cell));
            grid.appendChild(cell);
        }

        document.getElementById("spotRound").textContent = this.state.round + 1;
    },

    handleClick(isOdd, cell) {
        if (!this.state) return;

        if (isOdd) {
            this.state.found++;
            this.state.round++;
            document.getElementById("spotFound").textContent = this.state.found;
            playSound("audioCorrect", 3.5);
            cell.classList.add("spot-correct");

            if (this.state.round >= this.TOTAL_ROUNDS) {
                this.stopTimer();
                const t = i18n[AppState.lang];
                playSound("audioWin");
                showModal({
                    type: "win", icon: "🔍",
                    title: t.spotWinTitle,
                    message: t.spotWinMsg.replace("{t}", this.state.elapsed),
                    buttonText: t.playAgain,
                    onButton: () => this.reset(),
                });
            } else {
                setTimeout(() => this.nextRound(), 400);
            }
        } else {
            cell.classList.add("spot-wrong");
            playSound("audioWrong");
            setTimeout(() => cell.classList.remove("spot-wrong"), 300);
        }
    },
};
registerGame("spotdiff", SpotDiffGame);
