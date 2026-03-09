// ===== Tic-Tac-Toe i18n =====
Object.assign(i18n.ar, {
    tttTitle: "إكس أو",
    tttPlayer1: "لاعب 1",
    tttPlayer2: "لاعب 2",
    tttTurn: "الدور",
    tttNewRound: "جولة جديدة",
    tttWin: "فاز!",
    tttDraw: "تعادل!",
    tttDrawMsg: "لا يوجد فائز",
});

Object.assign(i18n.en, {
    tttTitle: "Tic-Tac-Toe",
    tttPlayer1: "Player 1",
    tttPlayer2: "Player 2",
    tttTurn: "Turn",
    tttNewRound: "New Round",
    tttWin: "Wins!",
    tttDraw: "Draw!",
    tttDrawMsg: "No winner this round",
});

// ===== Tic-Tac-Toe Game =====
const TicTacToe = {
    state: { board: Array(9).fill(null), player: "X", scoreX: 0, scoreO: 0, over: false },

    wins: [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],

    onEnter() {
        document.getElementById("tttResetBtn").onclick = () => this.reset();
        this.reset();
    },

    onLeave() {
        this.state.scoreX = 0;
        this.state.scoreO = 0;
    },

    onLanguageChange() {
        this.updateUI();
    },

    reset() {
        this.state.board = Array(9).fill(null);
        this.state.player = "X";
        this.state.over = false;
        this.buildBoard();
        this.updateUI();
    },

    buildBoard() {
        const board = document.getElementById("tttBoard");
        board.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("button");
            cell.className = "ttt-cell";
            cell.dataset.index = i;
            cell.addEventListener("click", () => this.handleClick(i));
            board.appendChild(cell);
        }
    },

    handleClick(i) {
        if (this.state.board[i] || this.state.over) return;

        this.state.board[i] = this.state.player;
        const cells = document.querySelectorAll(".ttt-cell");
        cells[i].textContent = this.state.player;
        cells[i].classList.add("taken", this.state.player.toLowerCase());
        playSound("audioCorrect", 3.5);

        const win = this.checkWin();
        if (win) {
            this.state.over = true;
            win.forEach((idx) => cells[idx].classList.add("win-cell"));
            if (this.state.player === "X") this.state.scoreX++;
            else this.state.scoreO++;
            this.updateUI();

            const t = i18n[AppState.lang];
            const name = this.state.player === "X" ? t.tttPlayer1 : t.tttPlayer2;
            playSound("audioWin");
            showModal({
                type: "win", icon: "🎉",
                title: name + " " + t.tttWin,
                message: this.state.player,
                buttonText: t.tttNewRound,
                onButton: () => this.reset(),
            });
            return;
        }

        if (this.state.board.every((c) => c !== null)) {
            this.state.over = true;
            const t = i18n[AppState.lang];
            showModal({
                type: "lose", icon: "🤝",
                title: t.tttDraw,
                message: t.tttDrawMsg,
                buttonText: t.tttNewRound,
                onButton: () => this.reset(),
            });
            return;
        }

        this.state.player = this.state.player === "X" ? "O" : "X";
        this.updateUI();
    },

    checkWin() {
        for (const [a, b, c] of this.wins) {
            if (this.state.board[a] && this.state.board[a] === this.state.board[b] && this.state.board[a] === this.state.board[c]) {
                return [a, b, c];
            }
        }
        return null;
    },

    updateUI() {
        document.getElementById("tttScoreX").textContent = this.state.scoreX;
        document.getElementById("tttScoreO").textContent = this.state.scoreO;
        document.getElementById("tttCurrentTurn").textContent = this.state.player;
        document.getElementById("tttPlayerX").classList.toggle("active-turn", this.state.player === "X");
        document.getElementById("tttPlayerO").classList.toggle("active-turn", this.state.player === "O");
    },
};

registerGame("tictactoe", TicTacToe);
