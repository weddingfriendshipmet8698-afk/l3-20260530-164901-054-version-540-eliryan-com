(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setHeroSlide(root, index) {
        var slides = root.querySelectorAll("[data-hero-slide]");
        var dots = root.querySelectorAll("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        var activeIndex = ((index % slides.length) + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
        root.setAttribute("data-active-slide", String(activeIndex));
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var dots = root.querySelectorAll("[data-hero-dot]");
        var current = 0;
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                current = Number(dot.getAttribute("data-hero-dot") || 0);
                setHeroSlide(root, current);
            });
        });
        window.setInterval(function () {
            current += 1;
            setHeroSlide(root, current);
        }, 5200);
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function readQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var categorySelect = document.querySelector('[data-filter-select="category"]');
        var kindSelect = document.querySelector('[data-filter-select="kind"]');
        if (!cards.length) {
            return;
        }
        if (input && !input.value) {
            input.value = readQueryParam("q");
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var category = normalize(categorySelect ? categorySelect.value : "");
            var kind = normalize(kindSelect ? kindSelect.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-filter-text"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var cardKind = normalize(card.getAttribute("data-kind"));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }
                if (kind && cardKind !== kind) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (categorySelect) {
            categorySelect.addEventListener("change", apply);
        }
        if (kindSelect) {
            kindSelect.addEventListener("change", apply);
        }
        apply();
    }

    ready(function () {
        setupHero();
        setupMobileNav();
        setupFiltering();
    });
})();
