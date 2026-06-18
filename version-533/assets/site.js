(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var index = 0;
    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    if (!input) {
      return;
    }
    var cards = selectAll('[data-search-item]');
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  function createResultCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster" href="' + item.url + '">' +
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-glow"></span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="badge-row">' + tags + '</div>' +
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="card-actions">' +
      '<a href="' + item.url + '" class="text-link">查看详情</a>' +
      '<a href="' + item.url + '#play" class="play-link">立即观看</a>' +
      '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    if (!results || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '';
        return;
      }
      var matches = window.SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 96);
      results.innerHTML = matches.map(createResultCard).join('');
    }
    input.addEventListener('input', render);
    render();
  }

  setupMenu();
  setupHero();
  setupLocalFilter();
  setupSearchPage();
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var layer = document.getElementById('playLayer');
  var hasLoaded = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function loadStream() {
    if (hasLoaded) {
      return;
    }
    hasLoaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    loadStream();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });

  video.addEventListener('emptied', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    hasLoaded = false;
  });
}
