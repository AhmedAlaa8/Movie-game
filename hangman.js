// ===== Hangman i18n =====
Object.assign(i18n.ar, {
    hangmanTitle: "لعبة المشنقة",
    hangmanErrors: "أخطاء",
    hangmanInputLabel: "ادخل اسم الفلم أو المسلسل",
    hangmanPlaceholder: "اكتب اسم الفلم هنا...",
    hangmanSubmitBtn: "ابدأ اللعب",
    hangmanInputError: "الرجاء إدخال اسم الفلم",
    hangmanWinTitle: "مبروك!",
    hangmanWinMsg: "الإجابة: ",
    hangmanLoseTitle: "انتهت اللعبة!",
    hangmanLoseMsg: "الإجابة الصحيحة: ",
});

Object.assign(i18n.en, {
    hangmanTitle: "Hangman",
    hangmanErrors: "Wrong",
    hangmanInputLabel: "Enter a movie or series name",
    hangmanPlaceholder: "Type the movie name here...",
    hangmanSubmitBtn: "Start Game",
    hangmanInputError: "Please enter a movie or series name",
    hangmanWinTitle: "Congratulations!",
    hangmanWinMsg: "Answer: ",
    hangmanLoseTitle: "Game Over!",
    hangmanLoseMsg: "The answer was: ",
});

// ===== Hangman Constants =====
const ARABIC_LETTERS = "ذضصثقفغعهخحجدطكمنتالبيسشءئؤرىةوزظ";
const ENGLISH_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const MAX_WRONG = 4;

// ===== Hangman Game =====
const HangmanGame = {
    state: { wrongCount: 0, correctCount: 0, spaceCount: 0, isStarted: false, movieName: "" },

    els: {},

    cacheElements() {
        this.els = {
            grid: document.getElementById("hangmanLettersGrid"),
            wordDisplay: document.getElementById("hangmanWordDisplay"),
            inputSection: document.getElementById("hangmanInputSection"),
            input: document.getElementById("hangmanInput"),
            submit: document.getElementById("hangmanSubmit"),
            togglePw: document.getElementById("hangmanTogglePassword"),
            eyeIcon: document.getElementById("hangmanEyeIcon"),
            error: document.getElementById("hangmanError"),
            wrongCount: document.getElementById("hangmanWrongCount"),
            gallowsBase: document.querySelector(".gallows-base"),
            gallowsPole: document.querySelector(".gallows-pole"),
            gallowsTop: document.querySelector(".gallows-top"),
            gallowsSupport: document.querySelector(".gallows-support"),
            gallowsRope: document.querySelector(".gallows-rope"),
            stickman: document.querySelector(".stickman"),
        };
    },

    onEnter() {
        this.cacheElements();
        this.reset();
        this.els.submit.onclick = () => this.startGame();
        this.els.input.onkeydown = (e) => { if (e.key === "Enter") this.startGame(); };
        this.els.togglePw.onclick = () => this.togglePassword();
    },

    onLeave() {
        this.reset();
    },

    onLanguageChange() {
        if (!this.state.isStarted) {
            this.buildKeyboard();
        }
    },

    reset() {
        this.state = { wrongCount: 0, correctCount: 0, spaceCount: 0, isStarted: false, movieName: "" };
        if (!this.els.grid) return;
        this.els.wrongCount.textContent = "0";
        this.els.wordDisplay.innerHTML = "";
        this.els.input.value = "";
        this.els.input.type = "password";
        this.els.eyeIcon.className = "fa-regular fa-eye";
        this.els.error.classList.remove("visible");
        this.els.inputSection.classList.remove("hidden");
        this.els.grid.style.pointerEvents = "none";
        this.els.grid.classList.remove("disabled");
        this.hideGallows();
        this.buildKeyboard();
        this.els.input.focus();
    },

    buildKeyboard() {
        const letters = AppState.lang === "ar" ? ARABIC_LETTERS : ENGLISH_LETTERS;
        this.els.grid.innerHTML = "";
        Array.from(letters).forEach((letter) => {
            const btn = document.createElement("button");
            btn.className = "letter-btn";
            btn.textContent = letter;
            btn.addEventListener("click", () => this.handleLetterClick(btn, letter));
            this.els.grid.appendChild(btn);
        });
    },

    startGame() {
        const val = this.els.input.value.trim();
        if (!val) { this.els.error.classList.add("visible"); return; }

        this.els.error.classList.remove("visible");
        this.state.movieName = val;
        this.state.isStarted = true;

        // Auto-detect language
        const hasArabic = /[\u0600-\u06FF]/.test(val);
        if (hasArabic && AppState.lang !== "ar") setLanguage("ar");
        else if (!hasArabic && AppState.lang !== "en") setLanguage("en");

        // Build word display
        Array.from(val.toLowerCase()).forEach((char) => {
            const slot = document.createElement("div");
            slot.className = "letter-slot";
            slot.dataset.char = char;
            if (char === " ") { slot.classList.add("space"); this.state.spaceCount++; }
            this.els.wordDisplay.appendChild(slot);
        });

        this.els.inputSection.classList.add("hidden");
        this.els.grid.style.pointerEvents = "auto";
        this.hideGallows();
    },

    handleLetterClick(btn, letter) {
        if (!this.state.isStarted || btn.classList.contains("used")) return;
        const chars = Array.from(this.state.movieName.toLowerCase());
        const slots = this.els.wordDisplay.querySelectorAll(".letter-slot");
        let correct = false;

        chars.forEach((char, i) => {
            if (char === letter) {
                correct = true;
                this.state.correctCount++;
                slots[i].textContent = Array.from(this.state.movieName)[i];
                slots[i].classList.add("revealed");
            }
        });

        if (correct) {
            btn.classList.add("used", "correct");
            playSound("audioCorrect", 3.5);
            if (this.state.correctCount >= chars.length - this.state.spaceCount) this.endGame(true);
        } else {
            btn.classList.add("used", "wrong-letter");
            this.state.wrongCount++;
            this.els.wrongCount.textContent = this.state.wrongCount;
            playSound("audioWrong", 3.5);
            this.revealPart(this.state.wrongCount);
            if (this.state.wrongCount >= MAX_WRONG) this.endGame(false);
        }
    },

    hideGallows() {
        ["gallowsBase", "gallowsPole", "gallowsTop", "gallowsSupport", "gallowsRope", "stickman"].forEach((k) => {
            if (this.els[k]) this.els[k].style.display = "none";
        });
        document.querySelectorAll(".stickman-arm-right,.stickman-arm-left,.stickman-leg-right,.stickman-leg-left").forEach((el) => {
            el.style.display = "";
        });
    },

    revealPart(n) {
        switch (n) {
            case 1: this.els.gallowsBase.style.display = "block"; this.els.gallowsPole.style.display = "block"; break;
            case 2: this.els.gallowsTop.style.display = "block"; this.els.gallowsSupport.style.display = "block"; this.els.gallowsRope.style.display = "block"; break;
            case 3: this.els.stickman.style.display = "block"; break;
            case 4: document.querySelectorAll(".stickman-arm-right,.stickman-arm-left,.stickman-leg-right,.stickman-leg-left").forEach((el) => el.style.display = "block"); break;
        }
    },

    endGame(won) {
        const t = i18n[AppState.lang];
        this.els.grid.classList.add("disabled");
        showModal({
            type: won ? "win" : "lose",
            icon: won ? "🎉" : "💀",
            title: won ? t.hangmanWinTitle : t.hangmanLoseTitle,
            message: (won ? t.hangmanWinMsg : t.hangmanLoseMsg) + this.state.movieName,
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
        playSound(won ? "audioWin" : "audioLose");
    },

    togglePassword() {
        const isPw = this.els.input.type === "password";
        this.els.input.type = isPw ? "text" : "password";
        this.els.eyeIcon.className = isPw ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    },
};

registerGame("hangman", HangmanGame);
