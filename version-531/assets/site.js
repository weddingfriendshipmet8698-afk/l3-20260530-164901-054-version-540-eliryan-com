(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) return;
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function restart() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }
      show(0);
      restart();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-card-search]');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-card'));
      var filterValue = '';

      function normalize(value) {
        return String(value || '').toLowerCase();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var haystack = normalize(card.textContent + ' ' + (card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-region') || '') + ' ' + (card.getAttribute('data-genre') || '') + ' ' + (card.getAttribute('data-tags') || ''));
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedButton = !filterValue || haystack.indexOf(normalize(filterValue)) !== -1;
          card.classList.toggle('hidden-card', !(matchedQuery && matchedButton));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          filterValue = button.getAttribute('data-filter-value') || '';
          buttons.forEach(function (btn) {
            btn.classList.toggle('active', btn === button);
          });
          apply();
        });
      });
    });

    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('[data-video]');
      var button = box.querySelector('[data-play]');
      var hls = null;
      var loaded = false;

      function start() {
        if (!video || !button) return;
        var stream = button.getAttribute('data-stream');
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          loaded = true;
        }
        button.classList.add('hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('hidden');
          });
        }
      }

      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (loaded) {
          button.classList.remove('hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });

    document.querySelectorAll('[data-copy-link]').forEach(function (button) {
      button.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
      });
    });

    var resultBox = document.querySelector('[data-search-results]');
    if (resultBox && window.SiteMovies) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      var title = document.querySelector('[data-search-title]');
      var desc = document.querySelector('[data-search-desc]');
      var formInput = document.querySelector('[data-global-search-form] input[name="q"]');
      if (formInput) {
        formInput.value = query;
      }
      if (query.trim()) {
        var q = query.trim().toLowerCase();
        var matches = window.SiteMovies.filter(function (movie) {
          return (movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags).toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120);
        if (title) {
          title.textContent = '搜索结果';
        }
        if (desc) {
          desc.textContent = matches.length ? '已找到相关影片，点击卡片进入详情页。' : '没有找到完全匹配的影片，可以尝试更换关键词。';
        }
        resultBox.innerHTML = matches.map(function (movie) {
          return '<article class="movie-card"><a class="movie-poster" href="' + movie.url + '"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="duration">' + movie.duration + '</span><span class="poster-meta"><b>' + escapeHtml(movie.region) + '</b><b>' + escapeHtml(movie.type) + '</b></span><span class="play-hover">▶</span></a><div class="movie-info"><h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="card-foot"><span>' + movie.views + ' 次观看</span><span>★ ' + movie.rating + '</span></div></div></article>';
        }).join('');
      }
    }
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }
})();
