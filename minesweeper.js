// ===== Minesweeper i18n =====
Object.assign(i18n.ar, {
    mineTitle: "كاسحة الألغام",
    mineMines: "ألغام",
    mineFlags: "أعلام",
    mineWinTitle: "فوز!",
    mineWinMsg: "كشفت كل المربعات!",
    mineLoseTitle: "انفجار!",
    mineLoseMsg: "داست على لغم!",
    mineFlagMode: "وضع العلم",
});
Object.assign(i18n.en, {
    mineTitle: "Minesweeper",
    mineMines: "Mines",
    mineFlags: "Flags",
    mineWinTitle: "You Win!",
    mineWinMsg: "All squares cleared!",
    mineLoseTitle: "Boom!",
    mineLoseMsg: "You hit a mine!",
    mineFlagMode: "Flag Mode",
});

const MinesweeperGame = {
    ROWS: 9, COLS: 9, MINES: 10,
    state: null,

    onEnter() { this.reset(); },
    onLeave() {},
    onLanguageChange() {},

    reset() {
        this.state = {
            board: [], revealed: [], flagged: [], over: false, won: false, firstClick: true, flagMode: false,
        };
        for (let r = 0; r < this.ROWS; r++) {
            this.state.board[r] = Array(this.COLS).fill(0);
            this.state.revealed[r] = Array(this.COLS).fill(false);
            this.state.flagged[r] = Array(this.COLS).fill(false);
        }
        document.getElementById("mineFlagCount").textContent = "0";
        const toggle = document.getElementById("mineFlagToggle");
        if (toggle) { toggle.classList.remove("active"); this.state.flagMode = false; }
        this.render();
    },

    placeMines(safeR, safeC) {
        let placed = 0;
        while (placed < this.MINES) {
            const r = Math.floor(Math.random() * this.ROWS);
            const c = Math.floor(Math.random() * this.COLS);
            if (this.state.board[r][c] === -1) continue;
            if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
            this.state.board[r][c] = -1;
            placed++;
        }
        for (let r = 0; r < this.ROWS; r++) for (let c = 0; c < this.COLS; c++) {
            if (this.state.board[r][c] === -1) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && this.state.board[nr][nc] === -1) count++;
            }
            this.state.board[r][c] = count;
        }
    },

    handleClick(r, c) {
        if (this.state.over) return;
        if (this.state.flagMode) { this.toggleFlag(r, c); return; }
        if (this.state.flagged[r][c]) return;
        if (this.state.firstClick) {
            this.state.firstClick = false;
            this.placeMines(r, c);
        }
        if (this.state.board[r][c] === -1) { this.lose(r, c); return; }
        this.reveal(r, c);
        this.checkWin();
        this.render();
    },

    toggleFlag(r, c) {
        if (this.state.revealed[r][c]) return;
        this.state.flagged[r][c] = !this.state.flagged[r][c];
        const count = this.state.flagged.flat().filter(Boolean).length;
        document.getElementById("mineFlagCount").textContent = count;
        this.render();
    },

    handleRightClick(r, c, e) {
        e.preventDefault();
        if (this.state.over || this.state.revealed[r][c]) return;
        this.toggleFlag(r, c);
    },

    reveal(r, c) {
        if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS) return;
        if (this.state.revealed[r][c] || this.state.flagged[r][c]) return;
        this.state.revealed[r][c] = true;
        if (this.state.board[r][c] === 0) {
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                this.reveal(r + dr, c + dc);
            }
        }
    },

    checkWin() {
        let unrevealed = 0;
        for (let r = 0; r < this.ROWS; r++) for (let c = 0; c < this.COLS; c++) {
            if (!this.state.revealed[r][c] && this.state.board[r][c] !== -1) unrevealed++;
        }
        if (unrevealed === 0) {
            this.state.over = true;
            this.state.won = true;
            const t = i18n[AppState.lang];
            playSound("audioWin");
            showModal({ type: "win", icon: "🎉", title: t.mineWinTitle, message: t.mineWinMsg, buttonText: t.playAgain, onButton: () => this.reset() });
        }
    },

    lose(r, c) {
        this.state.over = true;
        this.state.revealed[r][c] = true;
        // Reveal all mines
        for (let rr = 0; rr < this.ROWS; rr++) for (let cc = 0; cc < this.COLS; cc++) {
            if (this.state.board[rr][cc] === -1) this.state.revealed[rr][cc] = true;
        }
        this.render();
        const t = i18n[AppState.lang];
        playSound("audioLose");
        showModal({ type: "lose", icon: "💣", title: t.mineLoseTitle, message: t.mineLoseMsg, buttonText: t.playAgain, onButton: () => this.reset() });
    },

    render() {
        const board = document.getElementById("mineBoard");
        board.innerHTML = "";
        const colors = ["", "#6366f1", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#1e293b", "#94a3b8"];
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = document.createElement("button");
                cell.className = "mine-cell";
                if (this.state.revealed[r][c]) {
                    cell.classList.add("mine-revealed");
                    const v = this.state.board[r][c];
                    if (v === -1) { cell.textContent = "💣"; cell.classList.add("mine-bomb"); }
                    else if (v > 0) { cell.textContent = v; cell.style.color = colors[v]; }
                } else if (this.state.flagged[r][c]) {
                    cell.textContent = "🚩";
                    cell.classList.add("mine-flagged");
                }
                cell.addEventListener("click", () => this.handleClick(r, c));
                cell.addEventListener("contextmenu", (e) => this.handleRightClick(r, c, e));
                board.appendChild(cell);
            }
        }
    },
};
registerGame("minesweeper", MinesweeperGame);
