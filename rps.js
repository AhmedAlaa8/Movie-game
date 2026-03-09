// ===== Rock Paper Scissors i18n =====
Object.assign(i18n.ar, {
    rpsTitle: "حجر ورقة مقص",
    rpsYou: "أنت",
    rpsCPU: "الكمبيوتر",
    rpsScore: "النتيجة",
    rpsPick: "اختر!",
    rpsWin: "فزت!",
    rpsLose: "خسرت!",
    rpsDraw: "تعادل!",
    rpsRock: "حجر",
    rpsPaper: "ورقة",
    rpsScissors: "مقص",
});
Object.assign(i18n.en, {
    rpsTitle: "Rock Paper Scissors",
    rpsYou: "You",
    rpsCPU: "Computer",
    rpsScore: "Score",
    rpsPick: "Pick one!",
    rpsWin: "You win!",
    rpsLose: "You lose!",
    rpsDraw: "Draw!",
    rpsRock: "Rock",
    rpsPaper: "Paper",
    rpsScissors: "Scissors",
});

const RPSGame = {
    CHOICES: ["rock", "paper", "scissors"],
    EMOJIS: { rock: "🪨", paper: "📄", scissors: "✂️" },
    state: { wins: 0, losses: 0, draws: 0 },

    onEnter() {
        document.getElementById("rpsRock").onclick = () => this.play("rock");
        document.getElementById("rpsPaper").onclick = () => this.play("paper");
        document.getElementById("rpsScissors").onclick = () => this.play("scissors");
        this.reset();
    },
    onLeave() {},
    onLanguageChange() { this.updateScores(); },

    reset() {
        this.state = { wins: 0, losses: 0, draws: 0 };
        this.updateScores();
        document.getElementById("rpsResult").textContent = i18n[AppState.lang].rpsPick;
        document.getElementById("rpsPlayerChoice").textContent = "❓";
        document.getElementById("rpsCPUChoice").textContent = "❓";
    },

    play(choice) {
        const cpu = this.CHOICES[Math.floor(Math.random() * 3)];
        document.getElementById("rpsPlayerChoice").textContent = this.EMOJIS[choice];
        document.getElementById("rpsCPUChoice").textContent = this.EMOJIS[cpu];

        const t = i18n[AppState.lang];
        let result;
        if (choice === cpu) {
            result = "draw";
            this.state.draws++;
            document.getElementById("rpsResult").textContent = t.rpsDraw;
            playSound("audioCorrect", 3.5);
        } else if (
            (choice === "rock" && cpu === "scissors") ||
            (choice === "paper" && cpu === "rock") ||
            (choice === "scissors" && cpu === "paper")
        ) {
            result = "win";
            this.state.wins++;
            document.getElementById("rpsResult").textContent = t.rpsWin;
            document.getElementById("rpsResult").className = "rps-result rps-result-win";
            playSound("audioWin");
        } else {
            result = "lose";
            this.state.losses++;
            document.getElementById("rpsResult").textContent = t.rpsLose;
            document.getElementById("rpsResult").className = "rps-result rps-result-lose";
            playSound("audioWrong", 3.5);
        }
        if (result === "draw") document.getElementById("rpsResult").className = "rps-result";
        this.updateScores();

        // Animate
        document.getElementById("rpsPlayerChoice").classList.add("rps-bounce");
        document.getElementById("rpsCPUChoice").classList.add("rps-bounce");
        setTimeout(() => {
            document.getElementById("rpsPlayerChoice").classList.remove("rps-bounce");
            document.getElementById("rpsCPUChoice").classList.remove("rps-bounce");
        }, 500);
    },

    updateScores() {
        document.getElementById("rpsWins").textContent = this.state.wins;
        document.getElementById("rpsLosses").textContent = this.state.losses;
        document.getElementById("rpsDraws").textContent = this.state.draws;
    },
};
registerGame("rps", RPSGame);
