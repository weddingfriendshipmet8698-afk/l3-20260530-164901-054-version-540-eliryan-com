(function () {
  var body = document.body;
  var menuButton = document.querySelector(".menu-toggle");

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      body.classList.toggle("nav-open");
    });
  }

  document.querySelectorAll(".js-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target = "./search.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  document.querySelectorAll(".hero-slider").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var active = slides.findIndex(function (slide) {
      return slide.classList.contains("active");
    });

    if (active < 0) {
      active = 0;
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5500);
    }
  });

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function applyFilter(scope) {
    var queryInput = scope.querySelector(".filter-input");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .mini-card"));
    var query = normalize(queryInput ? queryInput.value : "");
    var selects = Array.prototype.slice.call(scope.querySelectorAll(".filter-select"));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var matched = !query || haystack.indexOf(query) !== -1;

      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter");
        var value = normalize(select.value);
        if (value && normalize(card.getAttribute("data-" + key)) !== value) {
          matched = false;
        }
      });

      card.classList.toggle("hidden-by-filter", !matched);
    });
  }

  document.querySelectorAll(".filter-scope").forEach(function (scope) {
    var queryInput = scope.querySelector(".filter-input");
    var resetButton = scope.querySelector(".filter-reset");
    var searchParams = new URLSearchParams(window.location.search);
    var initialQuery = searchParams.get("q");

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    scope.querySelectorAll(".filter-input, .filter-select").forEach(function (control) {
      control.addEventListener("input", function () {
        applyFilter(scope);
      });
      control.addEventListener("change", function () {
        applyFilter(scope);
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        scope.querySelectorAll(".filter-input").forEach(function (input) {
          input.value = "";
        });
        scope.querySelectorAll(".filter-select").forEach(function (select) {
          select.value = "";
        });
        applyFilter(scope);
      });
    }

    applyFilter(scope);
  });

  document.querySelectorAll(".back-top").forEach(function (button) {
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
})();
