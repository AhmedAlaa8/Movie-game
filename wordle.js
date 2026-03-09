// ===== Wordle i18n =====
Object.assign(i18n.ar, {
    wordleTitle: "خمن الكلمة",
    wordleAttempts: "المحاولات",
    wordleWinTitle: "أحسنت!",
    wordleWinMsg: "خمنت الكلمة في {n} محاولات",
    wordleLoseTitle: "انتهت اللعبة!",
    wordleLoseMsg: "الكلمة كانت: {w}",
    wordleInvalid: "الكلمة غير صحيحة",
});

Object.assign(i18n.en, {
    wordleTitle: "Wordle",
    wordleAttempts: "Attempts",
    wordleWinTitle: "Well Done!",
    wordleWinMsg: "You guessed it in {n} attempts",
    wordleLoseTitle: "Game Over!",
    wordleLoseMsg: "The word was: {w}",
    wordleInvalid: "Not a valid word",
});

// ===== Word Banks =====
const wordleBank = {
    en: [
        "apple", "brave", "crane", "dream", "eagle",
        "flame", "grape", "house", "juice", "knife",
        "lemon", "money", "night", "ocean", "piano",
        "queen", "river", "stone", "train", "ultra",
        "voice", "water", "yacht", "zebra", "angel",
        "black", "chair", "dance", "earth", "frown",
        "ghost", "heart", "ivory", "joker", "kneel",
        "light", "maple", "north", "olive", "pearl",
        "quest", "royal", "smile", "tower", "unity",
        "vital", "wheat", "youth", "blaze", "cloud",
    ],
    ar: [
        "كتاب", "بحار", "سلام", "عالم", "نجوم",
        "قمري", "شجرة", "زهور", "حديث", "علوم",
        "جبال", "رياح", "سماء", "بيوت", "شمعة",
        "قلعة", "مفتح", "ذهبي", "فضاء", "حياة",
        "أرضي", "ليلة", "صباح", "مطار", "بريد",
        "جسور", "كنوز", "لؤلؤ", "عسكر", "محيط",
    ],
};

const WORDLE_ROWS = 6;
const WORDLE_COLS = 5;

// ===== Wordle Game =====
const WordleGame = {
    state: null,

    onEnter() {
        this.handleKey = (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.key === "Enter") { this.submit(); return; }
            if (e.key === "Backspace") { this.deleteLetter(); return; }
            const letter = e.key.toLowerCase();
            if (/^[a-z]$/.test(letter) && AppState.lang === "en") this.addLetter(letter);
            if (/^[\u0600-\u06FF]$/.test(letter) && AppState.lang === "ar") this.addLetter(letter);
        };
        document.addEventListener("keydown", this.handleKey);
        this.reset();
    },

    onLeave() {
        document.removeEventListener("keydown", this.handleKey);
    },

    onLanguageChange() {
        this.reset();
    },

    reset() {
        const bank = wordleBank[AppState.lang] || wordleBank.en;
        const target = bank[Math.floor(Math.random() * bank.length)];
        this.state = {
            target: target,
            targetChars: Array.from(target),
            guesses: [],
            current: "",
            row: 0,
            over: false,
            shakeRow: -1,
        };
        this.buildGrid();
        this.buildKeyboard();
        this.updateAttempts();
    },

    buildGrid() {
        const grid = document.getElementById("wordleGrid");
        grid.innerHTML = "";
        for (let r = 0; r < WORDLE_ROWS; r++) {
            const row = document.createElement("div");
            row.className = "wordle-row";
            row.dataset.row = r;
            for (let c = 0; c < WORDLE_COLS; c++) {
                const cell = document.createElement("div");
                cell.className = "wordle-cell";
                cell.dataset.row = r;
                cell.dataset.col = c;
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }
    },

    buildKeyboard() {
        const kb = document.getElementById("wordleKeyboard");
        kb.innerHTML = "";
        let rows;
        if (AppState.lang === "ar") {
            rows = [
                "ض ص ث ق ف غ ع ه خ ح ج د".split(" "),
                "ش س ي ب ل ا ت ن م ك ط".split(" "),
                "enter ئ ء ؤ ر ى ة و ز ظ ذ back".split(" "),
            ];
        } else {
            rows = [
                "q w e r t y u i o p".split(" "),
                "a s d f g h j k l".split(" "),
                "enter z x c v b n m back".split(" "),
            ];
        }

        rows.forEach((row) => {
            const rowEl = document.createElement("div");
            rowEl.className = "wordle-kb-row";
            row.forEach((key) => {
                const btn = document.createElement("button");
                btn.className = "wordle-key";
                btn.dataset.key = key;
                if (key === "enter") {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    btn.classList.add("wordle-key-wide");
                    btn.addEventListener("click", () => this.submit());
                } else if (key === "back") {
                    btn.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
                    btn.classList.add("wordle-key-wide");
                    btn.addEventListener("click", () => this.deleteLetter());
                } else {
                    btn.textContent = AppState.lang === "en" ? key.toUpperCase() : key;
                    btn.addEventListener("click", () => this.addLetter(key));
                }
                rowEl.appendChild(btn);
            });
            kb.appendChild(rowEl);
        });
    },

    addLetter(letter) {
        if (this.state.over || Array.from(this.state.current).length >= WORDLE_COLS) return;
        this.state.current += letter;
        this.updateCurrentRow();
    },

    deleteLetter() {
        if (this.state.over || this.state.current.length === 0) return;
        const chars = Array.from(this.state.current);
        chars.pop();
        this.state.current = chars.join("");
        this.updateCurrentRow();
    },

    updateCurrentRow() {
        const chars = Array.from(this.state.current);
        for (let c = 0; c < WORDLE_COLS; c++) {
            const cell = document.querySelector(`.wordle-cell[data-row="${this.state.row}"][data-col="${c}"]`);
            if (!cell) continue;
            cell.textContent = chars[c] || "";
            cell.classList.toggle("wordle-cell-filled", !!chars[c]);
        }
    },

    submit() {
        if (this.state.over) return;
        const chars = Array.from(this.state.current);
        if (chars.length !== WORDLE_COLS) {
            this.shakeCurrentRow();
            return;
        }

        const guess = this.state.current;
        const result = this.evaluate(chars);

        // Reveal tiles
        for (let c = 0; c < WORDLE_COLS; c++) {
            const cell = document.querySelector(`.wordle-cell[data-row="${this.state.row}"][data-col="${c}"]`);
            if (!cell) continue;
            cell.style.animationDelay = (c * 0.15) + "s";
            cell.classList.add("wordle-cell-reveal", "wordle-" + result[c]);
        }

        // Update keyboard colors
        chars.forEach((ch, i) => {
            const keyBtn = document.querySelector(`.wordle-key[data-key="${ch}"]`);
            if (!keyBtn) return;
            const priority = { correct: 3, present: 2, absent: 1 };
            const current = keyBtn.dataset.state || "";
            if ((priority[result[i]] || 0) > (priority[current] || 0)) {
                keyBtn.classList.remove("wordle-kb-correct", "wordle-kb-present", "wordle-kb-absent");
                keyBtn.classList.add("wordle-kb-" + result[i]);
                keyBtn.dataset.state = result[i];
            }
        });

        this.state.guesses.push(guess);
        this.state.row++;
        this.state.current = "";
        this.updateAttempts();

        // Check win
        if (result.every((r) => r === "correct")) {
            this.state.over = true;
            const t = i18n[AppState.lang];
            playSound("audioWin");
            setTimeout(() => {
                showModal({
                    type: "win",
                    icon: "🎉",
                    title: t.wordleWinTitle,
                    message: t.wordleWinMsg.replace("{n}", this.state.guesses.length),
                    buttonText: t.playAgain,
                    onButton: () => this.reset(),
                });
            }, WORDLE_COLS * 150 + 400);
            return;
        }

        // Check lose
        if (this.state.row >= WORDLE_ROWS) {
            this.state.over = true;
            const t = i18n[AppState.lang];
            playSound("audioLose");
            setTimeout(() => {
                showModal({
                    type: "lose",
                    icon: "😞",
                    title: t.wordleLoseTitle,
                    message: t.wordleLoseMsg.replace("{w}", this.state.target),
                    buttonText: t.playAgain,
                    onButton: () => this.reset(),
                });
            }, WORDLE_COLS * 150 + 400);
            return;
        }

        playSound("audioCorrect", 3.5);
    },

    evaluate(guessChars) {
        const result = Array(WORDLE_COLS).fill("absent");
        const targetChars = [...this.state.targetChars];
        const remaining = [...targetChars];

        // First pass: correct positions
        guessChars.forEach((ch, i) => {
            if (ch === targetChars[i]) {
                result[i] = "correct";
                remaining[i] = null;
            }
        });

        // Second pass: present but wrong position
        guessChars.forEach((ch, i) => {
            if (result[i] === "correct") return;
            const idx = remaining.indexOf(ch);
            if (idx !== -1) {
                result[i] = "present";
                remaining[idx] = null;
            }
        });

        return result;
    },

    shakeCurrentRow() {
        const row = document.querySelector(`.wordle-row[data-row="${this.state.row}"]`);
        if (!row) return;
        row.classList.add("wordle-row-shake");
        setTimeout(() => row.classList.remove("wordle-row-shake"), 500);
    },

    updateAttempts() {
        document.getElementById("wordleAttempts").textContent = this.state.row;
    },
};

registerGame("wordle", WordleGame);
