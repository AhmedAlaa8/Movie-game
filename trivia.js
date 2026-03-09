// ===== Trivia i18n =====
Object.assign(i18n.ar, {
    trivTitle: "اختبر معلوماتك",
    trivScore: "النتيجة",
    trivQuestion: "السؤال",
    trivNext: "السؤال التالي",
    trivFinishTitle: "انتهى الاختبار!",
    trivFinishMsg: "نتيجتك: {s} من {t}",
    trivPerfect: "ممتاز! نتيجة كاملة!",
});

Object.assign(i18n.en, {
    trivTitle: "Trivia Quiz",
    trivScore: "Score",
    trivQuestion: "Question",
    trivNext: "Next Question",
    trivFinishTitle: "Quiz Complete!",
    trivFinishMsg: "Your score: {s} out of {t}",
    trivPerfect: "Perfect score!",
});

// ===== Question Bank =====
const triviaBank = {
    ar: [
        { q: "ما هي عاصمة فرنسا؟", a: ["لندن", "باريس", "برلين", "مدريد"], c: 1 },
        { q: "كم عدد كواكب المجموعة الشمسية؟", a: ["7", "8", "9", "10"], c: 1 },
        { q: "ما هو أكبر محيط في العالم؟", a: ["الأطلسي", "الهندي", "الهادئ", "المتجمد"], c: 2 },
        { q: "من رسم لوحة الموناليزا؟", a: ["بيكاسو", "دافنشي", "مايكل أنجلو", "رافائيل"], c: 1 },
        { q: "ما هي أطول نهر في العالم؟", a: ["الأمازون", "النيل", "الميسيسيبي", "اليانغتسي"], c: 1 },
        { q: "في أي سنة هبط الإنسان على القمر؟", a: ["1965", "1969", "1972", "1975"], c: 1 },
        { q: "ما هي العملة الرسمية لليابان؟", a: ["يوان", "وون", "ين", "باهت"], c: 2 },
        { q: "كم عدد أضلاع المثلث؟", a: ["2", "3", "4", "5"], c: 1 },
        { q: "ما هو أسرع حيوان بري؟", a: ["الأسد", "الفهد", "الحصان", "النعامة"], c: 1 },
        { q: "ما هو العنصر الكيميائي رمزه O؟", a: ["ذهب", "فضة", "أكسجين", "حديد"], c: 2 },
        { q: "أين يقع برج إيفل؟", a: ["لندن", "روما", "باريس", "برلين"], c: 2 },
        { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: ["زحل", "المشتري", "أورانوس", "نبتون"], c: 1 },
        { q: "كم عدد قارات العالم؟", a: ["5", "6", "7", "8"], c: 2 },
        { q: "ما هي لغة البرازيل الرسمية؟", a: ["الإسبانية", "البرتغالية", "الفرنسية", "الإنجليزية"], c: 1 },
        { q: "من اخترع المصباح الكهربائي؟", a: ["نيوتن", "أينشتاين", "إديسون", "تسلا"], c: 2 },
        { q: "ما هو أصغر دولة في العالم؟", a: ["موناكو", "الفاتيكان", "سان مارينو", "مالطا"], c: 1 },
        { q: "كم عدد أسنان الإنسان البالغ؟", a: ["28", "30", "32", "34"], c: 2 },
        { q: "ما هو الغاز الأكثر وفرة في الغلاف الجوي؟", a: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"], c: 1 },
        { q: "في أي قارة تقع مصر؟", a: ["آسيا", "أفريقيا", "أوروبا", "أمريكا"], c: 1 },
        { q: "ما هي عاصمة اليابان؟", a: ["بكين", "سيول", "طوكيو", "بانكوك"], c: 2 },
    ],
    en: [
        { q: "What is the capital of France?", a: ["London", "Paris", "Berlin", "Madrid"], c: 1 },
        { q: "How many planets are in our solar system?", a: ["7", "8", "9", "10"], c: 1 },
        { q: "What is the largest ocean?", a: ["Atlantic", "Indian", "Pacific", "Arctic"], c: 2 },
        { q: "Who painted the Mona Lisa?", a: ["Picasso", "Da Vinci", "Michelangelo", "Raphael"], c: 1 },
        { q: "What is the longest river in the world?", a: ["Amazon", "Nile", "Mississippi", "Yangtze"], c: 1 },
        { q: "In what year did humans land on the Moon?", a: ["1965", "1969", "1972", "1975"], c: 1 },
        { q: "What is the currency of Japan?", a: ["Yuan", "Won", "Yen", "Baht"], c: 2 },
        { q: "How many sides does a triangle have?", a: ["2", "3", "4", "5"], c: 1 },
        { q: "What is the fastest land animal?", a: ["Lion", "Cheetah", "Horse", "Ostrich"], c: 1 },
        { q: "What chemical element has the symbol O?", a: ["Gold", "Silver", "Oxygen", "Iron"], c: 2 },
        { q: "Where is the Eiffel Tower located?", a: ["London", "Rome", "Paris", "Berlin"], c: 2 },
        { q: "What is the largest planet in our solar system?", a: ["Saturn", "Jupiter", "Uranus", "Neptune"], c: 1 },
        { q: "How many continents are there?", a: ["5", "6", "7", "8"], c: 2 },
        { q: "What is the official language of Brazil?", a: ["Spanish", "Portuguese", "French", "English"], c: 1 },
        { q: "Who invented the light bulb?", a: ["Newton", "Einstein", "Edison", "Tesla"], c: 2 },
        { q: "What is the smallest country in the world?", a: ["Monaco", "Vatican City", "San Marino", "Malta"], c: 1 },
        { q: "How many teeth does an adult human have?", a: ["28", "30", "32", "34"], c: 2 },
        { q: "What is the most abundant gas in Earth's atmosphere?", a: ["Oxygen", "Nitrogen", "CO2", "Hydrogen"], c: 1 },
        { q: "On which continent is Egypt located?", a: ["Asia", "Africa", "Europe", "America"], c: 1 },
        { q: "What is the capital of Japan?", a: ["Beijing", "Seoul", "Tokyo", "Bangkok"], c: 2 },
    ],
};

// ===== Trivia Game =====
const QUESTIONS_PER_ROUND = 10;

const TriviaGame = {
    state: { questions: [], current: 0, score: 0, answered: false },

    onEnter() {
        document.getElementById("trivNextBtn").onclick = () => this.nextQuestion();
        this.reset();
    },

    onLeave() {},

    onLanguageChange() {
        // Restart quiz on language change
        this.reset();
    },

    reset() {
        const bank = triviaBank[AppState.lang] || triviaBank.en;
        const shuffled = [...bank];
        this.shuffle(shuffled);
        this.state.questions = shuffled.slice(0, QUESTIONS_PER_ROUND);
        this.state.current = 0;
        this.state.score = 0;
        this.state.answered = false;
        this.updateCounters();
        this.showQuestion();
    },

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    showQuestion() {
        const q = this.state.questions[this.state.current];
        if (!q) return;

        this.state.answered = false;
        document.getElementById("trivQuestionText").textContent = q.q;
        document.getElementById("trivNextBtn").style.display = "none";

        const container = document.getElementById("trivAnswers");
        container.innerHTML = "";

        q.a.forEach((answer, i) => {
            const btn = document.createElement("button");
            btn.className = "triv-answer-btn";
            btn.textContent = answer;
            btn.addEventListener("click", () => this.handleAnswer(i, btn));
            container.appendChild(btn);
        });

        // Update progress
        const pct = ((this.state.current + 1) / QUESTIONS_PER_ROUND) * 100;
        document.getElementById("trivProgressBar").style.width = pct + "%";
        this.updateCounters();
    },

    handleAnswer(selected, btn) {
        if (this.state.answered) return;
        this.state.answered = true;

        const q = this.state.questions[this.state.current];
        const btns = document.querySelectorAll(".triv-answer-btn");

        // Mark all as answered
        btns.forEach((b) => b.classList.add("answered"));

        // Highlight correct
        btns[q.c].classList.add("correct-answer");

        if (selected === q.c) {
            this.state.score++;
            playSound("audioCorrect", 3.5);
        } else {
            btn.classList.add("wrong-answer");
            playSound("audioWrong", 3.5);
        }

        this.updateCounters();
        document.getElementById("trivNextBtn").style.display = "flex";
    },

    nextQuestion() {
        this.state.current++;
        if (this.state.current >= QUESTIONS_PER_ROUND) {
            this.finishQuiz();
            return;
        }
        this.showQuestion();
    },

    finishQuiz() {
        const t = i18n[AppState.lang];
        const perfect = this.state.score === QUESTIONS_PER_ROUND;
        playSound(perfect ? "audioWin" : "audioCorrect");

        showModal({
            type: "win",
            icon: perfect ? "🌟" : "🏁",
            title: t.trivFinishTitle,
            message: perfect
                ? t.trivPerfect
                : t.trivFinishMsg.replace("{s}", this.state.score).replace("{t}", QUESTIONS_PER_ROUND),
            buttonText: t.playAgain,
            onButton: () => this.reset(),
        });
    },

    updateCounters() {
        document.getElementById("trivScore").textContent = this.state.score;
        document.getElementById("trivCurrent").textContent = this.state.current + 1;
    },
};

registerGame("trivia", TriviaGame);
