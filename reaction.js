// ===== Reaction Time i18n =====
Object.assign(i18n.ar, {
    reactTitle: "سرعة الردة",
    reactBest: "أفضل",
    reactWait: "انتظر اللون الأخضر...",
    reactClick: "!اضغط الآن",
    reactTooEarly: "بدري! اضغط لإعادة المحاولة",
    reactResult: "مللي ثانية {t}",
    reactAvg: "المتوسط: {a} مللي ثانية",
    reactTry: "المحاولة {n} من 5",
    reactDoneTitle: "النتيجة",
    reactDoneMsg: "متوسط سرعتك: {a} مللي ثانية",
    reactStart: "اضغط للبدء",
});
Object.assign(i18n.en, {
    reactTitle: "Reaction Time",
    reactBest: "Best",
    reactClick: "Click NOW!",
    reactWait: "Wait for green...",
    reactTooEarly: "Too early! Click to retry",
    reactResult: "{t} ms",
    reactAvg: "Average: {a} ms",
    reactTry: "Try {n} of 5",
    reactDoneTitle: "Results",
    reactDoneMsg: "Your average: {a} ms",
    reactStart: "Click to start",
});

const ReactionGame = {
    state: null,
    ROUNDS: 5,

    onEnter() {
        this.bestTime = parseInt(localStorage.getItem("reactionBest")) || 0;
        document.getElementById("reactBest").textContent = this.bestTime || "-";
        const zone = document.getElementById("reactZone");
        zone.onclick = () => this.handleClick();
        this.reset();
    },
    onLeave() {
        this.clearTimer();
    },
    onLanguageChange() {
        this.updateUI();
    },

    reset() {
        this.clearTimer();
        this.state = { phase: "idle", times: [], round: 0, startTime: 0, timer: null };
        this.updateUI();
    },

    clearTimer() {
        if (this.state && this.state.timer) {
            clearTimeout(this.state.timer);
            this.state.timer = null;
        }
    },

    updateUI() {
        const zone = document.getElementById("reactZone");
        const msg = document.getElementById("reactMsg");
        const timeEl = document.getElementById("reactTime");
        const results = document.getElementById("reactResults");
        const t = i18n[AppState.lang];

        switch (this.state.phase) {
            case "idle":
                zone.className = "react-zone react-idle";
                msg.textContent = t.reactStart;
                timeEl.textContent = "";
                results.textContent = "";
                break;
            case "waiting":
                zone.className = "react-zone react-waiting";
                msg.textContent = t.reactWait;
                timeEl.textContent = t.reactTry.replace("{n}", this.state.round + 1);
                break;
            case "ready":
                zone.className = "react-zone react-ready";
                msg.textContent = t.reactClick;
                timeEl.textContent = "";
                break;
            case "early":
                zone.className = "react-zone react-early";
                msg.textContent = t.reactTooEarly;
                timeEl.textContent = "";
                break;
            case "result":
                zone.className = "react-zone react-result";
                const lastTime = this.state.times[this.state.times.length - 1];
                msg.textContent = t.reactResult.replace("{t}", lastTime);
                const avg = Math.round(this.state.times.reduce((a, b) => a + b, 0) / this.state.times.length);
                timeEl.textContent = t.reactTry.replace("{n}", this.state.round);
                results.textContent = t.reactAvg.replace("{a}", avg);
                break;
        }
    },

    handleClick() {
        const t = i18n[AppState.lang];

        switch (this.state.phase) {
            case "idle":
                this.startRound();
                break;

            case "waiting":
                // Clicked too early
                this.clearTimer();
                this.state.phase = "early";
                playSound("audioWrong");
                this.updateUI();
                break;

            case "ready":
                // Calculate reaction time
                const reactionTime = Date.now() - this.state.startTime;
                this.state.times.push(reactionTime);
                this.state.round++;
                playSound("audioCorrect", 3.5);

                // Update best
                if (!this.bestTime || reactionTime < this.bestTime) {
                    this.bestTime = reactionTime;
                    localStorage.setItem("reactionBest", reactionTime);
                    document.getElementById("reactBest").textContent = reactionTime;
                }

                if (this.state.round >= this.ROUNDS) {
                    // Done
                    const avg = Math.round(this.state.times.reduce((a, b) => a + b, 0) / this.state.times.length);
                    this.state.phase = "idle";
                    this.updateUI();
                    playSound("audioWin");
                    showModal({
                        type: "win",
                        icon: "⚡",
                        title: t.reactDoneTitle,
                        message: t.reactDoneMsg.replace("{a}", avg),
                        buttonText: t.playAgain,
                        onButton: () => this.reset(),
                    });
                } else {
                    this.state.phase = "result";
                    this.updateUI();
                    // Auto start next round after 1.5s
                    this.state.timer = setTimeout(() => this.startRound(), 1500);
                }
                break;

            case "early":
                this.startRound();
                break;

            case "result":
                this.clearTimer();
                this.startRound();
                break;
        }
    },

    startRound() {
        this.state.phase = "waiting";
        this.updateUI();
        const delay = 1500 + Math.random() * 3500; // 1.5 - 5 seconds
        this.state.timer = setTimeout(() => {
            this.state.phase = "ready";
            this.state.startTime = Date.now();
            this.updateUI();
        }, delay);
    },
};
registerGame("reaction", ReactionGame);
