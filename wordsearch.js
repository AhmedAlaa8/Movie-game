// ===== Word Search i18n =====
Object.assign(i18n.ar, {
    wsTitle: "البحث عن الكلمات",
    wsFound: "وجدت",
    wsHint: "اضغط على الحروف لتكوين الكلمة",
    wsWinTitle: "أحسنت!",
    wsWinMsg: "وجدت كل الكلمات!",
    wsClear: "مسح",
});
Object.assign(i18n.en, {
    wsTitle: "Word Search",
    wsFound: "Found",
    wsHint: "Tap letters to form the word",
    wsWinTitle: "Well Done!",
    wsWinMsg: "All words found!",
    wsClear: "Clear",
});

const WordSearchGame = {
    state: null,
    SIZE: 8,

    WORDS_EN: ["GAME","PLAY","CODE","FAST","HERO","STAR","FIRE","MOON","BALL","JUMP"],
    WORDS_AR: ["لعبة","نجمة","قمر","شمس","بحر","نار","كرة","بيت"],

    onEnter() {
        document.getElementById("wsClearBtn").onclick = () => this.clearSelection();
        this.reset();
    },
    onLeave() {},
    onLanguageChange() { this.reset(); },

    reset() {
        const isAr = AppState.lang === "ar";
        const allWords = isAr ? this.WORDS_AR : this.WORDS_EN;
        const words = [...allWords].sort(() => Math.random() - 0.5).slice(0, 4);

        // Build grid
        const grid = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(""));

        // Place words horizontally or vertically
        const placed = [];
        for (const word of words) {
            const letters = Array.from(word);
            let ok = false;
            for (let attempt = 0; attempt < 50 && !ok; attempt++) {
                const dir = Math.random() < 0.5 ? "h" : "v";
                const maxR = dir === "v" ? this.SIZE - letters.length : this.SIZE - 1;
                const maxC = dir === "h" ? this.SIZE - letters.length : this.SIZE - 1;
                const r = Math.floor(Math.random() * (maxR + 1));
                const c = Math.floor(Math.random() * (maxC + 1));

                let fits = true;
                for (let i = 0; i < letters.length; i++) {
                    const gr = dir === "v" ? r + i : r;
                    const gc = dir === "h" ? c + i : c;
                    if (grid[gr][gc] !== "" && grid[gr][gc] !== letters[i]) { fits = false; break; }
                }
                if (fits) {
                    const cells = [];
                    for (let i = 0; i < letters.length; i++) {
                        const gr = dir === "v" ? r + i : r;
                        const gc = dir === "h" ? c + i : c;
                        grid[gr][gc] = letters[i];
                        cells.push(gr * this.SIZE + gc);
                    }
                    placed.push({ word, cells, found: false });
                    ok = true;
                }
            }
        }

        // Fill empty cells
        const chars = isAr ? "ابتثجحخدذرزسشصضطظعغفقكلمنهوي" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (grid[r][c] === "") grid[r][c] = chars[Math.floor(Math.random() * chars.length)];
            }
        }

        this.state = { grid, words: placed, selected: [], foundCount: 0 };
        document.getElementById("wsFound").textContent = "0 / " + placed.length;
        this.render();
    },

    render() {
        const boardEl = document.getElementById("wsBoard");
        boardEl.innerHTML = "";
        boardEl.style.gridTemplateColumns = `repeat(${this.SIZE}, 1fr)`;
        const dir = AppState.lang === "ar" ? "rtl" : "ltr";
        boardEl.dir = dir;

        const foundCells = new Set();
        this.state.words.forEach(w => { if (w.found) w.cells.forEach(c => foundCells.add(c)); });

        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const idx = r * this.SIZE + c;
                const cell = document.createElement("button");
                cell.className = "ws-cell";
                cell.textContent = this.state.grid[r][c];
                if (this.state.selected.includes(idx)) cell.classList.add("ws-selected");
                if (foundCells.has(idx)) cell.classList.add("ws-found");
                cell.addEventListener("click", () => this.toggleCell(idx));
                boardEl.appendChild(cell);
            }
        }

        // Word list
        const listEl = document.getElementById("wsWordList");
        listEl.innerHTML = "";
        this.state.words.forEach(w => {
            const span = document.createElement("span");
            span.className = "ws-word-item" + (w.found ? " ws-word-found" : "");
            span.textContent = w.word;
            listEl.appendChild(span);
        });
    },

    toggleCell(idx) {
        if (this.state.selected.includes(idx)) {
            this.state.selected = this.state.selected.filter(i => i !== idx);
        } else {
            this.state.selected.push(idx);
        }
        this.checkWord();
        this.render();
    },

    clearSelection() {
        this.state.selected = [];
        this.render();
    },

    checkWord() {
        const selLetters = this.state.selected.map(idx => {
            const r = Math.floor(idx / this.SIZE), c = idx % this.SIZE;
            return this.state.grid[r][c];
        }).join("");

        for (const w of this.state.words) {
            if (w.found) continue;
            const sortedWord = [...w.cells].sort((a, b) => a - b);
            const sortedSel = [...this.state.selected].sort((a, b) => a - b);
            if (sortedWord.length === sortedSel.length && sortedWord.every((v, i) => v === sortedSel[i])) {
                w.found = true;
                this.state.foundCount++;
                this.state.selected = [];
                document.getElementById("wsFound").textContent = this.state.foundCount + " / " + this.state.words.length;
                playSound("audioCorrect", 3.5);

                if (this.state.words.every(w => w.found)) {
                    const t = i18n[AppState.lang];
                    playSound("audioWin");
                    showModal({ type: "win", icon: "🔠", title: t.wsWinTitle, message: t.wsWinMsg, buttonText: t.playAgain, onButton: () => this.reset() });
                }
                return;
            }
        }
    },
};
registerGame("wordsearch", WordSearchGame);
