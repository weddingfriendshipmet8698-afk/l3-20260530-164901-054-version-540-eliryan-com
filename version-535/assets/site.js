(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function applyGridFilter(root) {
            var input = root.querySelector("[data-filter-input]");
            var select = root.querySelector("[data-year-select]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search]"));

            function filterCards() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var year = select ? select.value : "all";
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var yearGroup = card.getAttribute("data-year-group") || "";
                    var matchText = !term || text.indexOf(term) !== -1;
                    var matchYear = year === "all" || year === yearGroup;
                    card.classList.toggle("hidden-card", !(matchText && matchYear));
                });
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }
            if (select) {
                select.addEventListener("change", filterCards);
            }
            filterCards();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(applyGridFilter);

        var searchRoot = document.querySelector("[data-search-root]");
        if (searchRoot) {
            var field = searchRoot.querySelector("[data-filter-input]");
            var form = searchRoot.querySelector("[data-search-form]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (field && query) {
                field.value = query;
            }
            if (form && field) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    var next = field.value.trim();
                    var url = next ? "search.html?q=" + encodeURIComponent(next) : "search.html";
                    window.history.replaceState(null, "", url);
                    applyGridFilter(searchRoot);
                });
            }
            applyGridFilter(searchRoot);
        }
    });
})();
