// ===== Typing Speed i18n =====
Object.assign(i18n.ar, {
    typeTitle: "سرعة الكتابة",
    typeWPM: "كلمة/دقيقة",
    typeTime: "الوقت",
    typeStart: "ابدأ الكتابة!",
    typeFinishTitle: "النتيجة",
    typeFinishMsg: "سرعتك: {w} كلمة/دقيقة",
    typePlaceholder: "ابدأ الكتابة هنا...",
});
Object.assign(i18n.en, {
    typeTitle: "Typing Speed",
    typeWPM: "WPM",
    typeTime: "Time",
    typeStart: "Start typing!",
    typeFinishTitle: "Results",
    typeFinishMsg: "Your speed: {w} WPM",
    typePlaceholder: "Start typing here...",
});

const wordsEn = "the be to of and in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us code game play fast slow quick run jump open close read write true false".split(" ");
const wordsAr = "كتاب بيت ماء نار ولد بنت شمس قمر نجم بحر سمك لون صوت باب يوم ليل صبح حب عين يد وقت بلد مدينة شارع جبل نهر شجر ورد سماء ارض حيوان طعام شاي لبن خبز رز سكر ملح فلفل بصل طبخ غرفة كرسي طاولة ساعة قلم كتب درس لعب فاز نام صحا مشى وقف جلس قام اكل شرب فتح قفل ضحك بكى سمع نظر".split(" ");

const TYPING_TIME = 30;

const TypingGame = {
    state: null,

    onEnter() {
        this.reset();
    },
    onLeave() { this.stop(); },
    onLanguageChange() { this.reset(); },

    reset() {
        this.stop();
        const isAr = AppState.lang === "ar";
        const words = isAr ? wordsAr : wordsEn;
        const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 40);
        this.state = { words: shuffled, typed: "", wordIndex: 0, correct: 0, started: false, timer: null, timeLeft: TYPING_TIME };
        // Set text direction for word box and input
        const dir = isAr ? "rtl" : "ltr";
        document.getElementById("typeWords").dir = dir;
        document.getElementById("typeInput").dir = dir;
        this.renderWords();
        document.getElementById("typeTimeLeft").textContent = TYPING_TIME;
        document.getElementById("typeWPM").textContent = "0";
        const input = document.getElementById("typeInput");
        input.value = "";
        input.disabled = false;
        input.focus();
        input.oninput = () => this.handleInput();
        input.onkeydown = (e) => { if (e.key === " ") { e.preventDefault(); this.nextWord(); } };
    },

    stop() {
        if (this.state && this.state.timer) { clearInterval(this.state.timer); this.state.timer = null; }
    },

    startTimer() {
        this.state.started = true;
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            document.getElementById("typeTimeLeft").textContent = this.state.timeLeft;
            if (this.state.timeLeft <= 0) this.finish();
        }, 1000);
    },

    handleInput() {
        if (!this.state.started) this.startTimer();
        const input = document.getElementById("typeInput");
        this.state.typed = input.value;
        this.highlightCurrent();
    },

    nextWord() {
        const input = document.getElementById("typeInput");
        const typed = input.value.trim();
        if (typed === this.state.words[this.state.wordIndex]) {
            this.state.correct++;
            playSound("audioCorrect", 3.5);
        } else {
            playSound("audioWrong", 3.5);
        }
        this.state.wordIndex++;
        const wpm = Math.round((this.state.correct / (TYPING_TIME - this.state.timeLeft || 1)) * 60);
        document.getElementById("typeWPM").textContent = wpm;
        input.value = "";
        this.state.typed = "";
        if (this.state.wordIndex >= this.state.words.length) { this.finish(); return; }
        this.renderWords();
    },

    highlightCurrent() {
        const wordEls = document.querySelectorAll(".type-word");
        if (!wordEls[this.state.wordIndex]) return;
        const word = this.state.words[this.state.wordIndex];
        const typed = this.state.typed;
        let html = "";
        Array.from(word).forEach((ch, i) => {
            if (i < typed.length) {
                html += typed[i] === ch
                    ? `<span class="type-correct">${ch}</span>`
                    : `<span class="type-wrong">${ch}</span>`;
            } else {
                html += ch;
            }
        });
        wordEls[this.state.wordIndex].innerHTML = html;
    },

    renderWords() {
        const container = document.getElementById("typeWords");
        container.innerHTML = "";
        this.state.words.forEach((word, i) => {
            const span = document.createElement("span");
            span.className = "type-word";
            if (i < this.state.wordIndex) span.classList.add("type-done");
            if (i === this.state.wordIndex) span.classList.add("type-current");
            span.textContent = word;
            container.appendChild(span);
        });
    },

    finish() {
        this.stop();
        const input = document.getElementById("typeInput");
        input.disabled = true;
        const elapsed = TYPING_TIME - this.state.timeLeft || 1;
        const wpm = Math.round((this.state.correct / elapsed) * 60);
        document.getElementById("typeWPM").textContent = wpm;
        const t = i18n[AppState.lang];
        playSound("audioWin");
        showModal({ type: "win", icon: "⌨️", title: t.typeFinishTitle, message: t.typeFinishMsg.replace("{w}", wpm), buttonText: t.playAgain, onButton: () => this.reset() });
    },
};
registerGame("typingspeed", TypingGame);
