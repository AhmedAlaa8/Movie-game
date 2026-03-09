// ===== Shared i18n =====
const i18n = {
    ar: {
        menuTitle: "ألعاب مصغرة",
        backToMenu: "القائمة",
        playAgain: "العب مرة أخرى",
        menuHangman: "لعبة المشنقة",
        menuHangmanDesc: "خمن حروف اسم الفلم",
        menuTicTacToe: "إكس أو",
        menuTicTacToeDesc: "لعبة لاعبين",
        menuMemory: "لعبة الذاكرة",
        menuMemoryDesc: "أوجد الأزواج المتشابهة",
        menuTrivia: "اختبر معلوماتك",
        menuTriviaDesc: "أسئلة وأجوبة",
        menuSnake: "لعبة الثعبان",
        menuSnakeDesc: "كل واكبر",
        menuWordle: "خمن الكلمة",
        menuWordleDesc: "خمن الكلمة في 6 محاولات",
        menu2048: "2048",
        menu2048Desc: "ادمج الأرقام لتصل إلى 2048",
        menuMine: "كاسحة الألغام",
        menuMineDesc: "تجنب القنابل المخفية",
        menuSimon: "سيمون يقول",
        menuSimonDesc: "تذكر تسلسل الألوان",
        menuFlappy: "الطائر القافز",
        menuFlappyDesc: "اطير بين العوائق",
        menuTyping: "سرعة الكتابة",
        menuTypingDesc: "اختبر سرعتك في الطباعة",
        menuRPS: "حجر ورقة مقص",
        menuRPSDesc: "العب ضد الكمبيوتر",
        menuPuzzle: "البازل",
        menuPuzzleDesc: "رتب الأرقام بالترتيب",
        menuColor: "تطابق الألوان",
        menuColorDesc: "حدد لون النص الصحيح",
        menuReaction: "سرعة الردة",
        menuReactionDesc: "اختبر سرعة ردة فعلك",
        menuBreakout: "كسر الطوب",
        menuBreakoutDesc: "كسر الطوب بالكرة",
        menuWhack: "اضرب الخلد",
        menuWhackDesc: "اضرب قبل ما يختفي",
        menuMath: "تحدي الرياضيات",
        menuMathDesc: "حل المسائل بسرعة",
        menuDodge: "تفادي السقوط",
        menuDodgeDesc: "اجمع العملات وتفادى",
        menuSpot: "اوجد الاختلاف",
        menuSpotDesc: "اكتشف الرمز المختلف",
        menuWS: "البحث عن الكلمات",
        menuWSDesc: "ابحث عن الكلمات المخفية",
        menuBalloon: "فرقع البالونات",
        menuBalloonDesc: "فرقع أكبر عدد",
        menuTower: "بناء البرج",
        menuTowerDesc: "ابني أعلى برج",
        menuFruit: "التقط الفواكه",
        menuFruitDesc: "التقط وتجنب القنابل",
        brandTagline: "عالم الألعاب المصغرة",
        brandFooter: "صنع بواسطة",
        brandGamesCount: "لعبة متاحة",
        menuChooseGame: "اختر لعبتك",
        menuSearchPlaceholder: "ابحث عن لعبة...",
        menuNoResults: "لا توجد نتائج",
    },
    en: {
        menuTitle: "Mini Games",
        backToMenu: "Menu",
        playAgain: "Play Again",
        menuHangman: "Hangman",
        menuHangmanDesc: "Guess the movie letters",
        menuTicTacToe: "Tic-Tac-Toe",
        menuTicTacToeDesc: "Two player game",
        menuMemory: "Memory Match",
        menuMemoryDesc: "Find the matching pairs",
        menuTrivia: "Trivia Quiz",
        menuTriviaDesc: "Test your knowledge",
        menuSnake: "Snake",
        menuSnakeDesc: "Eat and grow",
        menuWordle: "Wordle",
        menuWordleDesc: "Guess the word in 6 tries",
        menu2048: "2048",
        menu2048Desc: "Merge numbers to reach 2048",
        menuMine: "Minesweeper",
        menuMineDesc: "Avoid the hidden bombs",
        menuSimon: "Simon Says",
        menuSimonDesc: "Remember the color sequence",
        menuFlappy: "Flappy Bird",
        menuFlappyDesc: "Fly through the obstacles",
        menuTyping: "Typing Speed",
        menuTypingDesc: "Test your typing speed",
        menuRPS: "Rock Paper Scissors",
        menuRPSDesc: "Play against the computer",
        menuPuzzle: "Puzzle Slider",
        menuPuzzleDesc: "Arrange numbers in order",
        menuColor: "Color Match",
        menuColorDesc: "Identify the correct text color",
        menuReaction: "Reaction Time",
        menuReactionDesc: "Test your reflexes",
        menuBreakout: "Breakout",
        menuBreakoutDesc: "Break bricks with the ball",
        menuWhack: "Whack-a-Mole",
        menuWhackDesc: "Hit before it hides",
        menuMath: "Math Challenge",
        menuMathDesc: "Solve problems fast",
        menuDodge: "Dodge",
        menuDodgeDesc: "Collect coins & dodge",
        menuSpot: "Spot the Odd",
        menuSpotDesc: "Find the different emoji",
        menuWS: "Word Search",
        menuWSDesc: "Find hidden words",
        menuBalloon: "Balloon Pop",
        menuBalloonDesc: "Pop as many as you can",
        menuTower: "Tower Stack",
        menuTowerDesc: "Build the tallest tower",
        menuFruit: "Catch Fruits",
        menuFruitDesc: "Catch & dodge bombs",
        brandTagline: "Mini Games World",
        brandFooter: "Made by",
        brandGamesCount: "games available",
        menuChooseGame: "Choose Your Game",
        menuSearchPlaceholder: "Search for a game...",
        menuNoResults: "No results found",
    },
};

// ===== App State =====
const AppState = {
    lang: "ar",
};

// ===== Game Registry =====
window.GameRegistry = {};

function registerGame(id, gameObject) {
    window.GameRegistry[id] = gameObject;
}

// ===== Language System =====
function setLanguage(lang) {
    AppState.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.style.direction = lang === "ar" ? "rtl" : "ltr";

    // Update all elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });

    // Update placeholder attributes
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        if (i18n[lang][key]) {
            el.placeholder = i18n[lang][key];
        }
    });

    // Update toggle active states
    document.querySelectorAll(".lang-option").forEach((opt) => {
        opt.classList.toggle("active", opt.dataset.lang === lang);
    });

    // Notify active game
    const currentGame = Navigation?.currentScreen;
    if (currentGame && window.GameRegistry[currentGame]?.onLanguageChange) {
        window.GameRegistry[currentGame].onLanguageChange(lang);
    }
}

// ===== Audio Helper =====
function playSound(audioId, rate = 1) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    audio.playbackRate = rate;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// ===== Shared Modal =====
let modalCallback = null;

function showModal(config) {
    const overlay = document.getElementById("modalOverlay");
    const modal = document.getElementById("gameModal");
    const icon = document.getElementById("modalIcon");
    const title = document.getElementById("modalTitle");
    const message = document.getElementById("modalMessage");
    const btn = document.getElementById("modalBtn");

    modal.className = "modal " + (config.type || "");
    icon.textContent = config.icon || "";
    title.textContent = config.title || "";
    message.textContent = config.message || "";
    btn.textContent = config.buttonText || i18n[AppState.lang].playAgain;

    modalCallback = config.onButton || null;
    overlay.classList.add("active");
}

function hideModal() {
    document.getElementById("modalOverlay").classList.remove("active");
    if (modalCallback) {
        modalCallback();
        modalCallback = null;
    }
}

// Modal button listener
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("modalBtn").addEventListener("click", hideModal);

    // Language toggles (menu + any game headers)
    document.querySelectorAll(".lang-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            setLanguage(AppState.lang === "ar" ? "en" : "ar");
        });
    });

    // Initialize language
    setLanguage("ar");
});
