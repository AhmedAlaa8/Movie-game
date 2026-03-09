// ===== Snake i18n =====
Object.assign(i18n.ar, {
    snakeTitle: "لعبة الثعبان",
    snakeScore: "النتيجة",
    snakeBest: "أفضل",
    snakeStart: "اضغط للبدء",
    snakeGameOver: "انتهت اللعبة!",
    snakeGameOverMsg: "نتيجتك: {s}",
    snakeNewBest: "رقم قياسي جديد!",
    snakeControls: "استخدم الأسهم أو اسحب للتحريك",
});

Object.assign(i18n.en, {
    snakeTitle: "Snake",
    snakeScore: "Score",
    snakeBest: "Best",
    snakeStart: "Tap to Start",
    snakeGameOver: "Game Over!",
    snakeGameOverMsg: "Your score: {s}",
    snakeNewBest: "New high score!",
    snakeControls: "Use arrows or swipe to move",
});

// ===== Snake Game =====
const SnakeGame = {
    canvas: null,
    ctx: null,
    state: null,
    interval: null,
    bestScore: 0,
    CELL: 20,
    COLS: 15,
    ROWS: 15,
    SPEED: 130,

    onEnter() {
        this.canvas = document.getElementById("snakeCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.COLS * this.CELL;
        this.canvas.height = this.ROWS * this.CELL;
        this.bestScore = parseInt(localStorage.getItem("snakeBest") || "0");
        document.getElementById("snakeBestScore").textContent = this.bestScore;

        this.handleKey = (e) => {
            const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
            if (map[e.key]) {
                e.preventDefault();
                this.setDir(map[e.key]);
            }
        };
        document.addEventListener("keydown", this.handleKey);

        // Touch / swipe
        this.touchStart = null;
        this.canvas.addEventListener("touchstart", (e) => {
            this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: true });
        this.canvas.addEventListener("touchend", (e) => {
            if (!this.touchStart) return;
            const dx = e.changedTouches[0].clientX - this.touchStart.x;
            const dy = e.changedTouches[0].clientY - this.touchStart.y;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                if (!this.state || !this.state.running) this.start();
                return;
            }
            if (Math.abs(dx) > Math.abs(dy)) {
                this.setDir(dx > 0 ? "right" : "left");
            } else {
                this.setDir(dy > 0 ? "down" : "up");
            }
        }, { passive: true });

        // Click to start
        this.canvas.addEventListener("click", () => {
            if (!this.state || !this.state.running) this.start();
        });

        // D-pad buttons
        document.getElementById("snakeBtnUp").onclick = () => this.setDir("up");
        document.getElementById("snakeBtnDown").onclick = () => this.setDir("down");
        document.getElementById("snakeBtnLeft").onclick = () => this.setDir("left");
        document.getElementById("snakeBtnRight").onclick = () => this.setDir("right");

        this.reset();
    },

    onLeave() {
        this.stop();
        document.removeEventListener("keydown", this.handleKey);
    },

    onLanguageChange() {},

    reset() {
        this.stop();
        this.state = {
            snake: [{ x: 7, y: 7 }],
            dir: "right",
            nextDir: "right",
            food: null,
            score: 0,
            running: false,
        };
        this.placeFood();
        this.draw();
        this.drawOverlay(i18n[AppState.lang].snakeStart);
        document.getElementById("snakeScoreVal").textContent = "0";
    },

    start() {
        if (this.state && this.state.running) return;
        this.state.running = true;
        this.interval = setInterval(() => this.tick(), this.SPEED);
    },

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    setDir(dir) {
        if (!this.state || !this.state.running) {
            if (!this.state || !this.state.running) this.start();
        }
        const opp = { up: "down", down: "up", left: "right", right: "left" };
        if (dir !== opp[this.state.dir]) {
            this.state.nextDir = dir;
        }
    },

    placeFood() {
        const occupied = new Set(this.state.snake.map((s) => s.x + "," + s.y));
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * this.COLS), y: Math.floor(Math.random() * this.ROWS) };
        } while (occupied.has(pos.x + "," + pos.y));
        this.state.food = pos;
    },

    tick() {
        const s = this.state;
        s.dir = s.nextDir;
        const head = { ...s.snake[0] };

        switch (s.dir) {
            case "up": head.y--; break;
            case "down": head.y++; break;
            case "left": head.x--; break;
            case "right": head.x++; break;
        }

        // Wall wrap-around
        if (head.x < 0) head.x = this.COLS - 1;
        else if (head.x >= this.COLS) head.x = 0;
        if (head.y < 0) head.y = this.ROWS - 1;
        else if (head.y >= this.ROWS) head.y = 0;

        // Self collision
        if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
            this.gameOver();
            return;
        }

        s.snake.unshift(head);

        // Eat food
        if (head.x === s.food.x && head.y === s.food.y) {
            s.score++;
            document.getElementById("snakeScoreVal").textContent = s.score;
            playSound("audioCorrect", 3.5);
            this.placeFood();
        } else {
            s.snake.pop();
        }

        this.draw();
    },

    draw() {
        const c = this.ctx;
        const cell = this.CELL;

        // Background
        c.fillStyle = "#1e293b";
        c.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        c.strokeStyle = "rgba(255,255,255,0.03)";
        c.lineWidth = 1;
        for (let x = 0; x <= this.COLS; x++) {
            c.beginPath(); c.moveTo(x * cell, 0); c.lineTo(x * cell, this.ROWS * cell); c.stroke();
        }
        for (let y = 0; y <= this.ROWS; y++) {
            c.beginPath(); c.moveTo(0, y * cell); c.lineTo(this.COLS * cell, y * cell); c.stroke();
        }

        // Food
        if (this.state.food) {
            const fx = this.state.food.x * cell + cell / 2;
            const fy = this.state.food.y * cell + cell / 2;
            c.fillStyle = "#ef4444";
            c.beginPath();
            c.arc(fx, fy, cell / 2.5, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#f87171";
            c.beginPath();
            c.arc(fx - 2, fy - 2, cell / 5, 0, Math.PI * 2);
            c.fill();
        }

        // Snake
        this.state.snake.forEach((seg, i) => {
            const x = seg.x * cell;
            const y = seg.y * cell;
            const r = 4;
            if (i === 0) {
                // Head
                c.fillStyle = "#34d399";
                c.beginPath();
                c.roundRect(x + 1, y + 1, cell - 2, cell - 2, r);
                c.fill();
                // Eyes
                c.fillStyle = "#0f172a";
                const ex1 = x + cell * 0.3, ex2 = x + cell * 0.7, ey = y + cell * 0.35;
                c.beginPath(); c.arc(ex1, ey, 2, 0, Math.PI * 2); c.fill();
                c.beginPath(); c.arc(ex2, ey, 2, 0, Math.PI * 2); c.fill();
            } else {
                // Body gradient
                const ratio = 1 - (i / this.state.snake.length) * 0.4;
                c.fillStyle = `rgba(16, 185, 129, ${ratio})`;
                c.beginPath();
                c.roundRect(x + 1, y + 1, cell - 2, cell - 2, r);
                c.fill();
            }
        });
    },

    drawOverlay(text) {
        const c = this.ctx;
        c.fillStyle = "rgba(15, 23, 42, 0.7)";
        c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        c.fillStyle = "#f1f5f9";
        c.font = "bold 18px 'Segoe UI', sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    },

    gameOver() {
        this.stop();
        this.state.running = false;
        const t = i18n[AppState.lang];
        const isNewBest = this.state.score > this.bestScore;
        if (isNewBest) {
            this.bestScore = this.state.score;
            localStorage.setItem("snakeBest", this.bestScore);
            document.getElementById("snakeBestScore").textContent = this.bestScore;
        }

        playSound("audioLose");
        showModal({
            type: "lose",
            icon: "🐍",
            title: t.snakeGameOver,
            message: (isNewBest ? t.snakeNewBest + " " : "") + t.snakeGameOverMsg.replace("{s}", this.state.score),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },
};

registerGame("snake", SnakeGame);
