// ===== Memory Match i18n =====
Object.assign(i18n.ar, {
    memTitle: "لعبة الذاكرة",
    memMoves: "المحاولات",
    memPairs: "الأزواج",
    memWinTitle: "أحسنت!",
    memWinMsg: "أنهيت اللعبة في {n} محاولة",
});

Object.assign(i18n.en, {
    memTitle: "Memory Match",
    memMoves: "Moves",
    memPairs: "Pairs",
    memWinTitle: "Well Done!",
    memWinMsg: "You finished in {n} moves",
});

// ===== Memory Match Game =====
const EMOJIS = ["🍎", "🍕", "🚀", "🎸", "🌟", "🐱", "🎯", "💎"];

const MemoryGame = {
    state: { cards: [], flipped: [], matched: 0, moves: 0, locked: false },

    onEnter() {
        this.reset();
    },

    onLeave() {},

    onLanguageChange() {},

    reset() {
        this.state = { cards: [], flipped: [], matched: 0, moves: 0, locked: false };
        document.getElementById("memMoveCount").textContent = "0";
        document.getElementById("memPairCount").textContent = "0";

        // Create shuffled pairs
        const pairs = [...EMOJIS, ...EMOJIS];
        this.shuffle(pairs);
        this.state.cards = pairs;
        this.buildBoard();
    },

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    buildBoard() {
        const board = document.getElementById("memBoard");
        board.innerHTML = "";

        this.state.cards.forEach((emoji, i) => {
            const card = document.createElement("div");
            card.className = "mem-card";
            card.dataset.index = i;
            card.innerHTML = `
                <div class="mem-card-inner">
                    <div class="mem-card-front">?</div>
                    <div class="mem-card-back">${emoji}</div>
                </div>
            `;
            card.addEventListener("click", () => this.handleClick(i, card));
            board.appendChild(card);
        });
    },

    handleClick(index, card) {
        if (this.state.locked) return;
        if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

        card.classList.add("flipped");
        this.state.flipped.push({ index, card });
        playSound("audioCorrect", 3.5);

        if (this.state.flipped.length === 2) {
            this.state.moves++;
            document.getElementById("memMoveCount").textContent = this.state.moves;

            const [a, b] = this.state.flipped;

            if (this.state.cards[a.index] === this.state.cards[b.index]) {
                // Match!
                a.card.classList.add("matched");
                b.card.classList.add("matched");
                this.state.matched++;
                document.getElementById("memPairCount").textContent = this.state.matched;
                this.state.flipped = [];

                if (this.state.matched === EMOJIS.length) {
                    setTimeout(() => this.endGame(), 400);
                }
            } else {
                // No match - flip back
                this.state.locked = true;
                playSound("audioWrong", 3.5);
                setTimeout(() => {
                    a.card.classList.remove("flipped");
                    b.card.classList.remove("flipped");
                    this.state.flipped = [];
                    this.state.locked = false;
                }, 800);
            }
        }
    },

    endGame() {
        const t = i18n[AppState.lang];
        playSound("audioWin");
        showModal({
            type: "win",
            icon: "🏆",
            title: t.memWinTitle,
            message: t.memWinMsg.replace("{n}", this.state.moves),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },
};

registerGame("memory", MemoryGame);
