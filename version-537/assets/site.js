(function () {
  var body = document.body;
  var base = body ? body.getAttribute('data-base') || '' : '';

  function joinUrl(path) {
    if (!path) {
      return base + 'index.html';
    }
    return base + path;
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    startTimer();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-category') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyLocalFilters(scope) {
    var input = scope.querySelector('[data-local-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var category = scope.querySelector('[data-category-filter]');
    var grid = document.querySelector('[data-filter-grid]');
    var count = document.querySelector('[data-result-count]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function update() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var categoryValue = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchesCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var show = matchesQuery && matchesYear && matchesType && matchesCategory;
        card.classList.toggle('is-filter-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [input, year, type, category].forEach(function (item) {
      if (item) {
        item.addEventListener('input', update);
        item.addEventListener('change', update);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    update();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(applyLocalFilters);

  function setupQuickSearch(form) {
    var input = form.querySelector('[data-search-input]');
    var panel = form.querySelector('[data-search-results]');
    if (!input || !panel || !window.SEARCH_INDEX) {
      return;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      panel.innerHTML = '';
      if (!query) {
        panel.classList.remove('is-open');
        return;
      }
      var results = window.SEARCH_INDEX.filter(function (item) {
        return item.text.indexOf(query) !== -1;
      }).slice(0, 6);
      if (!results.length) {
        panel.classList.remove('is-open');
        return;
      }
      results.forEach(function (item) {
        var link = document.createElement('a');
        link.href = joinUrl(item.url);
        var title = document.createElement('strong');
        title.textContent = item.title;
        var meta = document.createElement('span');
        meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
        link.appendChild(title);
        link.appendChild(meta);
        panel.appendChild(link);
      });
      panel.classList.add('is-open');
    }

    input.addEventListener('input', render);
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(setupQuickSearch);
})();
