// ===== Navigation System =====
const Navigation = {
    currentScreen: "mainMenu",

    navigateTo(screenId) {
        const currentEl = document.getElementById(this.currentScreen);
        const targetEl = document.getElementById(screenId);
        if (!targetEl) return;

        // Leave current game
        if (window.GameRegistry[this.currentScreen]?.onLeave) {
            window.GameRegistry[this.currentScreen].onLeave();
        }

        // Hide current, show target
        if (currentEl) currentEl.classList.remove("active");
        targetEl.classList.add("active");
        this.currentScreen = screenId;

        // Enter new game
        if (window.GameRegistry[screenId]?.onEnter) {
            window.GameRegistry[screenId].onEnter();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    },

    goHome() {
        // Hide modal if open (without triggering callback)
        document.getElementById("modalOverlay").classList.remove("active");
        modalCallback = null;
        this.navigateTo("mainMenu");
    },
};

// Menu card click handlers
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".menu-card").forEach((card) => {
        card.addEventListener("click", () => {
            const game = card.dataset.game;
            if (game) Navigation.navigateTo(game);
        });
    });

    // ===== Menu Search =====
    const searchInput = document.getElementById("menuSearchInput");
    const searchClear = document.getElementById("menuSearchClear");
    const noResults = document.getElementById("menuNoResults");
    const sectionLabel = document.querySelector(".menu-section-label");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim().toLowerCase();
            const cards = document.querySelectorAll(".menu-card");
            let visibleCount = 0;

            // Show/hide clear button
            if (searchClear) {
                searchClear.classList.toggle("visible", query.length > 0);
            }

            cards.forEach(card => {
                const title = (card.querySelector(".menu-card-title")?.textContent || "").toLowerCase();
                const desc = (card.querySelector(".menu-card-desc")?.textContent || "").toLowerCase();
                const matches = !query || title.includes(query) || desc.includes(query);
                card.classList.toggle("search-hidden", !matches);
                if (matches) visibleCount++;
            });

            // Show/hide no results
            if (noResults) {
                noResults.classList.toggle("visible", visibleCount === 0 && query.length > 0);
            }
            // Hide section label when searching
            if (sectionLabel) {
                sectionLabel.style.display = query.length > 0 ? "none" : "";
            }
        });

        // Clear button
        if (searchClear) {
            searchClear.addEventListener("click", () => {
                searchInput.value = "";
                searchInput.dispatchEvent(new Event("input"));
                searchInput.focus();
            });
        }
    }
});
