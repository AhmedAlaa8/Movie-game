// ===== Puzzle Slider i18n =====
Object.assign(i18n.ar, {
    puzzleTitle: "البازل",
    puzzleMoves: "الخطوات",
    puzzleWinTitle: "أحسنت!",
    puzzleWinMsg: "حللت البازل في {n} خطوة",
    puzzleShuffle: "خلط",
});
Object.assign(i18n.en, {
    puzzleTitle: "Puzzle Slider",
    puzzleMoves: "Moves",
    puzzleWinTitle: "Solved!",
    puzzleWinMsg: "You solved it in {n} moves",
    puzzleShuffle: "Shuffle",
});

const PuzzleGame = {
    SIZE: 4,
    state: null,

    onEnter() {
        document.getElementById("puzzleShuffleBtn").onclick = () => this.reset();
        this.reset();
    },
    onLeave() {},
    onLanguageChange() {},

    reset() {
        // Create solved state [1,2,...,15,0]
        const tiles = [];
        for (let i = 1; i < this.SIZE * this.SIZE; i++) tiles.push(i);
        tiles.push(0);
        // Shuffle by making random valid moves
        let emptyIdx = tiles.length - 1;
        for (let i = 0; i < 200; i++) {
            const neighbors = this.getNeighbors(emptyIdx);
            const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
            [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
            emptyIdx = pick;
        }
        this.state = { tiles, moves: 0, won: false };
        document.getElementById("puzzleMoveCount").textContent = "0";
        this.render();
    },

    getNeighbors(idx) {
        const r = Math.floor(idx / this.SIZE), c = idx % this.SIZE;
        const n = [];
        if (r > 0) n.push(idx - this.SIZE);
        if (r < this.SIZE - 1) n.push(idx + this.SIZE);
        if (c > 0) n.push(idx - 1);
        if (c < this.SIZE - 1) n.push(idx + 1);
        return n;
    },

    handleClick(idx) {
        if (this.state.won) return;
        const emptyIdx = this.state.tiles.indexOf(0);
        const neighbors = this.getNeighbors(emptyIdx);
        if (!neighbors.includes(idx)) return;

        [this.state.tiles[emptyIdx], this.state.tiles[idx]] = [this.state.tiles[idx], this.state.tiles[emptyIdx]];
        this.state.moves++;
        document.getElementById("puzzleMoveCount").textContent = this.state.moves;
        playSound("audioCorrect", 3.5);
        this.render();

        if (this.isSolved()) {
            this.state.won = true;
            const t = i18n[AppState.lang];
            playSound("audioWin");
            showModal({ type: "win", icon: "🧩", title: t.puzzleWinTitle, message: t.puzzleWinMsg.replace("{n}", this.state.moves), buttonText: t.playAgain, onButton: () => this.reset() });
        }
    },

    isSolved() {
        for (let i = 0; i < this.state.tiles.length - 1; i++) {
            if (this.state.tiles[i] !== i + 1) return false;
        }
        return this.state.tiles[this.state.tiles.length - 1] === 0;
    },

    render() {
        const board = document.getElementById("puzzleBoard");
        board.innerHTML = "";
        const emptyIdx = this.state.tiles.indexOf(0);
        const movable = this.getNeighbors(emptyIdx);
        this.state.tiles.forEach((val, i) => {
            const tile = document.createElement("button");
            tile.className = "puzzle-tile" + (val === 0 ? " puzzle-empty" : "");
            if (val && movable.includes(i)) tile.classList.add("puzzle-movable");
            tile.textContent = val || "";
            if (val) {
                tile.addEventListener("click", () => this.handleClick(i));
                tile.addEventListener("touchend", (e) => { e.preventDefault(); this.handleClick(i); });
            }
            board.appendChild(tile);
        });
    },
};
registerGame("puzzle", PuzzleGame);
