// ===== Color Match i18n =====
Object.assign(i18n.ar, {
    colorTitle: "تطابق الألوان",
    colorScore: "النتيجة",
    colorTime: "الوقت",
    colorQuestion: "ما هو لون النص؟",
    colorFinishTitle: "النتيجة!",
    colorFinishMsg: "نتيجتك: {s} من {t}",
    colorPerfect: "نتيجة مثالية!",
});
Object.assign(i18n.en, {
    colorTitle: "Color Match",
    colorScore: "Score",
    colorTime: "Time",
    colorQuestion: "What COLOR is the text?",
    colorFinishTitle: "Results!",
    colorFinishMsg: "Your score: {s} out of {t}",
    colorPerfect: "Perfect score!",
});

const COLOR_LIST = [
    { name: { ar: "أحمر", en: "RED" }, hex: "#ef4444" },
    { name: { ar: "أزرق", en: "BLUE" }, hex: "#3b82f6" },
    { name: { ar: "أخضر", en: "GREEN" }, hex: "#10b981" },
    { name: { ar: "أصفر", en: "YELLOW" }, hex: "#eab308" },
    { name: { ar: "بنفسجي", en: "PURPLE" }, hex: "#8b5cf6" },
    { name: { ar: "برتقالي", en: "ORANGE" }, hex: "#f97316" },
];

const COLOR_ROUNDS = 15;
const COLOR_TIME = 20;

const ColorMatchGame = {
    state: null,

    onEnter() { this.reset(); },
    onLeave() { this.stop(); },
    onLanguageChange() { this.reset(); },

    reset() {
        this.stop();
        this.state = { score: 0, round: 0, timeLeft: COLOR_TIME, timer: null, over: false, correctIdx: -1 };
        document.getElementById("colorScoreVal").textContent = "0";
        document.getElementById("colorTimeLeft").textContent = COLOR_TIME;
        this.nextRound();
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            document.getElementById("colorTimeLeft").textContent = this.state.timeLeft;
            if (this.state.timeLeft <= 0) this.finish();
        }, 1000);
    },

    stop() {
        if (this.state && this.state.timer) { clearInterval(this.state.timer); this.state.timer = null; }
    },

    nextRound() {
        if (this.state.round >= COLOR_ROUNDS) { this.finish(); return; }
        this.state.round++;
        const lang = AppState.lang;

        // Pick a random text (color name) and a DIFFERENT color to display it in
        const textIdx = Math.floor(Math.random() * COLOR_LIST.length);
        let colorIdx;
        do { colorIdx = Math.floor(Math.random() * COLOR_LIST.length); } while (colorIdx === textIdx);

        const display = document.getElementById("colorDisplay");
        display.textContent = COLOR_LIST[textIdx].name[lang];
        display.style.color = COLOR_LIST[colorIdx].hex;
        this.state.correctIdx = colorIdx;

        // Build answer buttons (4 choices including the correct one)
        const choices = new Set([colorIdx]);
        while (choices.size < 4) choices.add(Math.floor(Math.random() * COLOR_LIST.length));
        const choiceArr = [...choices].sort(() => Math.random() - 0.5);

        const container = document.getElementById("colorChoices");
        container.innerHTML = "";
        choiceArr.forEach((idx) => {
            const btn = document.createElement("button");
            btn.className = "color-choice-btn";
            btn.textContent = COLOR_LIST[idx].name[lang];
            btn.style.borderColor = COLOR_LIST[idx].hex;
            btn.style.color = COLOR_LIST[idx].hex;
            btn.addEventListener("click", () => this.handleChoice(idx, btn));
            container.appendChild(btn);
        });
    },

    handleChoice(idx, btn) {
        if (this.state.over) return;
        const btns = document.querySelectorAll(".color-choice-btn");
        btns.forEach(b => b.style.pointerEvents = "none");

        if (idx === this.state.correctIdx) {
            this.state.score++;
            btn.classList.add("color-correct");
            playSound("audioCorrect", 3.5);
        } else {
            btn.classList.add("color-wrong");
            btns.forEach(b => { if (parseInt(b.dataset.idx) === this.state.correctIdx) b.classList.add("color-correct"); });
            playSound("audioWrong", 3.5);
        }
        document.getElementById("colorScoreVal").textContent = this.state.score;
        setTimeout(() => this.nextRound(), 600);
    },

    finish() {
        this.stop();
        this.state.over = true;
        const t = i18n[AppState.lang];
        const perfect = this.state.score === COLOR_ROUNDS;
        playSound(perfect ? "audioWin" : "audioCorrect");
        showModal({
            type: "win", icon: "🎨",
            title: t.colorFinishTitle,
            message: perfect ? t.colorPerfect : t.colorFinishMsg.replace("{s}", this.state.score).replace("{t}", COLOR_ROUNDS),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },
};
registerGame("colormatch", ColorMatchGame);
