(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-nav-links]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var result = document.querySelector('[data-filter-result]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    if (!cards.length || (!input && !typeFilter && !yearFilter)) {
      return;
    }
    function apply() {
      var q = normalize(input ? input.value : '');
      var type = normalize(typeFilter ? typeFilter.value : '');
      var minYear = Number(yearFilter ? yearFilter.value : 0) || 0;
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var year = Number(card.getAttribute('data-year')) || 0;
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }
        if (minYear && year < minYear) {
          matched = false;
        }
        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          shown += 1;
        }
      });
      if (result) {
        result.textContent = '当前显示 ' + shown + ' 部影片';
      }
    }
    [input, typeFilter, yearFilter].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && input) {
      input.value = initial;
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
