// ===== Math Challenge i18n =====
Object.assign(i18n.ar, {
    mathTitle: "تحدي الرياضيات",
    mathScore: "النتيجة",
    mathTime: "الوقت",
    mathPlaceholder: "الجواب...",
    mathDoneTitle: "انتهى!",
    mathDoneMsg: "أجبت {s} إجابة صحيحة",
    mathStreak: "متتالية",
});
Object.assign(i18n.en, {
    mathTitle: "Math Challenge",
    mathScore: "Score",
    mathTime: "Time",
    mathPlaceholder: "Answer...",
    mathDoneTitle: "Time's Up!",
    mathDoneMsg: "You got {s} correct answers",
    mathStreak: "Streak",
});

const MathGame = {
    state: null,
    GAME_TIME: 60,

    onEnter() { this.reset(); },
    onLeave() { this.stop(); },
    onLanguageChange() {
        document.getElementById("mathInput").placeholder = i18n[AppState.lang].mathPlaceholder;
    },

    reset() {
        this.stop();
        this.state = { score: 0, streak: 0, bestStreak: 0, timeLeft: this.GAME_TIME, timer: null, answer: 0, started: false };
        document.getElementById("mathScoreVal").textContent = "0";
        document.getElementById("mathTimeLeft").textContent = this.GAME_TIME;
        document.getElementById("mathStreak").textContent = "0";
        const input = document.getElementById("mathInput");
        input.value = "";
        input.disabled = false;
        input.placeholder = i18n[AppState.lang].mathPlaceholder;
        input.focus();
        input.onkeydown = (e) => { if (e.key === "Enter") this.checkAnswer(); };
        document.getElementById("mathSubmitBtn").onclick = () => this.checkAnswer();

        const feedback = document.getElementById("mathFeedback");
        feedback.textContent = "";
        feedback.className = "math-feedback";

        this.generateQuestion();
    },

    stop() {
        if (this.state && this.state.timer) { clearInterval(this.state.timer); this.state.timer = null; }
    },

    startTimer() {
        this.state.started = true;
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            document.getElementById("mathTimeLeft").textContent = this.state.timeLeft;
            if (this.state.timeLeft <= 0) this.finish();
        }, 1000);
    },

    generateQuestion() {
        const ops = ["+", "-", "*"];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b, answer;

        switch (op) {
            case "+":
                a = Math.floor(Math.random() * 50) + 1;
                b = Math.floor(Math.random() * 50) + 1;
                answer = a + b;
                break;
            case "-":
                a = Math.floor(Math.random() * 50) + 10;
                b = Math.floor(Math.random() * a);
                answer = a - b;
                break;
            case "*":
                a = Math.floor(Math.random() * 12) + 1;
                b = Math.floor(Math.random() * 12) + 1;
                answer = a * b;
                break;
        }

        const symbol = op === "*" ? "×" : op;
        document.getElementById("mathQuestion").textContent = `${a} ${symbol} ${b} = ?`;
        this.state.answer = answer;
    },

    checkAnswer() {
        if (!this.state) return;
        if (this.state.timeLeft <= 0) return;
        if (!this.state.started) this.startTimer();

        const input = document.getElementById("mathInput");
        const val = parseInt(input.value.trim());
        const feedback = document.getElementById("mathFeedback");

        if (isNaN(val)) return;

        if (val === this.state.answer) {
            this.state.score++;
            this.state.streak++;
            if (this.state.streak > this.state.bestStreak) this.state.bestStreak = this.state.streak;
            document.getElementById("mathScoreVal").textContent = this.state.score;
            document.getElementById("mathStreak").textContent = this.state.streak;
            feedback.textContent = "✓";
            feedback.className = "math-feedback math-correct";
            playSound("audioCorrect", 3.5);
        } else {
            this.state.streak = 0;
            document.getElementById("mathStreak").textContent = "0";
            feedback.textContent = this.state.answer;
            feedback.className = "math-feedback math-wrong";
            playSound("audioWrong");
        }

        input.value = "";
        input.focus();
        this.generateQuestion();
    },

    finish() {
        this.stop();
        document.getElementById("mathInput").disabled = true;
        const t = i18n[AppState.lang];
        playSound("audioWin");
        showModal({
            type: "win",
            icon: "🔢",
            title: t.mathDoneTitle,
            message: t.mathDoneMsg.replace("{s}", this.state.score),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },
};
registerGame("mathgame", MathGame);
