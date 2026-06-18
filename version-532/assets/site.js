(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          event.preventDefault();
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var paused = false;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });

    hero.addEventListener("mouseenter", function () {
      paused = true;
    });

    hero.addEventListener("mouseleave", function () {
      paused = false;
    });

    window.setInterval(function () {
      if (!paused) {
        activate(current + 1);
      }
    }, 6200);

    activate(0);
  }

  function setupFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }
    var input = filterRoot.querySelector("[data-filter-input]");
    var yearSelect = filterRoot.querySelector("[data-filter-year]");
    var typeSelect = filterRoot.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var empty = document.querySelector("[data-empty-state]");

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var matchesType = !type || card.getAttribute("data-type") === type;
        var show = matchesKeyword && matchesYear && matchesType;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }

    apply();
  }

  function setupBackTop() {
    var button = document.querySelector("[data-backtop]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function loadPlayer() {
    var config = document.getElementById("player-config");
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");
    if (!config || !video || !layer) {
      return;
    }

    var streamUrl = "";
    try {
      streamUrl = JSON.parse(config.textContent || "{}").url || "";
    } catch (error) {
      streamUrl = "";
    }

    if (!streamUrl) {
      return;
    }

    var hlsInstance = null;
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);

        if (window.Hls.Events && window.Hls.Events.ERROR) {
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        }
        return;
      }

      video.src = streamUrl;
    }

    function start() {
      attach();
      layer.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          layer.classList.remove("is-hidden");
        });
      }
    }

    layer.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupBackTop();
    loadPlayer();
  });
})();
