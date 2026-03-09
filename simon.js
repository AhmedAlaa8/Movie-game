// ===== Simon Says i18n =====
Object.assign(i18n.ar, {
    simonTitle: "سيمون",
    simonRound: "الجولة",
    simonWatch: "شاهد التسلسل...",
    simonYourTurn: "دورك!",
    simonWinTitle: "ممتاز!",
    simonWinMsg: "وصلت للجولة {n}!",
    simonLoseTitle: "خطأ!",
    simonLoseMsg: "وصلت للجولة {n}",
    simonStart: "ابدأ",
});
Object.assign(i18n.en, {
    simonTitle: "Simon Says",
    simonRound: "Round",
    simonWatch: "Watch the sequence...",
    simonYourTurn: "Your turn!",
    simonWinTitle: "Amazing!",
    simonWinMsg: "You reached round {n}!",
    simonLoseTitle: "Wrong!",
    simonLoseMsg: "You reached round {n}",
    simonStart: "Start",
});

const SimonGame = {
    state: null,
    COLORS: ["red", "blue", "green", "yellow"],
    tones: {},

    onEnter() {
        document.getElementById("simonStartBtn").onclick = () => this.startGame();
        this.COLORS.forEach((color) => {
            document.getElementById("simon-" + color).addEventListener("click", () => this.handleClick(color));
        });
        this.reset();
    },
    onLeave() { this.reset(); },
    onLanguageChange() { this.updateStatus(); },

    reset() {
        this.state = { sequence: [], playerIndex: 0, round: 0, playing: false, showing: false };
        document.getElementById("simonRound").textContent = "0";
        this.updateStatus();
    },

    startGame() {
        this.state = { sequence: [], playerIndex: 0, round: 0, playing: true, showing: false };
        this.nextRound();
    },

    nextRound() {
        this.state.round++;
        this.state.playerIndex = 0;
        document.getElementById("simonRound").textContent = this.state.round;
        this.state.sequence.push(this.COLORS[Math.floor(Math.random() * 4)]);
        this.showSequence();
    },

    updateStatus() {
        const t = i18n[AppState.lang];
        const el = document.getElementById("simonStatus");
        if (!this.state.playing) el.textContent = t.simonStart;
        else if (this.state.showing) el.textContent = t.simonWatch;
        else el.textContent = t.simonYourTurn;
    },

    async showSequence() {
        this.state.showing = true;
        this.updateStatus();
        this.setButtons(false);
        await this.sleep(400);
        for (const color of this.state.sequence) {
            this.lightUp(color);
            await this.sleep(500);
            this.lightDown(color);
            await this.sleep(200);
        }
        this.state.showing = false;
        this.setButtons(true);
        this.updateStatus();
    },

    lightUp(color) {
        const el = document.getElementById("simon-" + color);
        el.classList.add("simon-active");
        playSound("audioCorrect", 2 + this.COLORS.indexOf(color) * 0.5);
    },

    lightDown(color) {
        document.getElementById("simon-" + color).classList.remove("simon-active");
    },

    setButtons(enabled) {
        this.COLORS.forEach((c) => {
            document.getElementById("simon-" + c).style.pointerEvents = enabled ? "auto" : "none";
        });
    },

    handleClick(color) {
        if (!this.state.playing || this.state.showing) return;
        this.lightUp(color);
        setTimeout(() => this.lightDown(color), 200);

        if (color === this.state.sequence[this.state.playerIndex]) {
            this.state.playerIndex++;
            if (this.state.playerIndex >= this.state.sequence.length) {
                setTimeout(() => this.nextRound(), 600);
            }
        } else {
            this.state.playing = false;
            this.setButtons(false);
            playSound("audioWrong", 3.5);
            const t = i18n[AppState.lang];
            setTimeout(() => {
                playSound("audioLose");
                showModal({
                    type: "lose", icon: "🎵",
                    title: t.simonLoseTitle,
                    message: t.simonLoseMsg.replace("{n}", this.state.round),
                    buttonText: t.playAgain,
                    onButton: () => this.reset(),
                });
            }, 400);
        }
    },

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
};
registerGame("simon", SimonGame);
