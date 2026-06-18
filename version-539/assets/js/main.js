(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const previous = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (target) => {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    dots.forEach((dot, itemIndex) => {
      dot.addEventListener('click', () => {
        show(itemIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const region = scope.querySelector('[data-filter-region]');
    const type = scope.querySelector('[data-filter-type]');
    const year = scope.querySelector('[data-filter-year]');
    const reset = scope.querySelector('[data-filter-reset]');
    const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
    const empty = scope.querySelector('[data-empty-state]');

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value : '';
      const typeValue = type ? type.value : '';
      const yearValue = year ? year.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const text = `${card.dataset.title || ''} ${card.dataset.region || ''} ${card.dataset.type || ''} ${card.dataset.year || ''} ${card.dataset.tags || ''}`.toLowerCase();
        const okQuery = !query || text.includes(query);
        const okRegion = !regionValue || card.dataset.region === regionValue;
        const okType = !typeValue || card.dataset.type === typeValue;
        const okYear = !yearValue || card.dataset.year === yearValue;
        const isVisible = okQuery && okRegion && okType && okYear;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, region, type, year].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }

    apply();
  });

  const loadScript = (url) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      if (window.Hls) {
        resolve();
      } else {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const prepareVideo = (video) => {
    if (!video || video.dataset.ready === '1') {
      return Promise.resolve();
    }

    const stream = video.getAttribute('data-stream');
    if (!stream) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
      return Promise.resolve();
    }

    const start = () => {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
        video.dataset.ready = '1';
        return Promise.resolve();
      }

      video.src = stream;
      video.dataset.ready = '1';
      return Promise.resolve();
    };

    if (window.Hls) {
      return start();
    }

    return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js')
      .then(start)
      .catch(() => {
        video.src = stream;
        video.dataset.ready = '1';
      });
  };

  document.querySelectorAll('[data-player]').forEach((box) => {
    const video = box.querySelector('video');
    const cover = box.querySelector('[data-player-cover]');
    let pendingPlay = false;

    const play = () => {
      pendingPlay = true;
      prepareVideo(video).then(() => {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
        pendingPlay = false;
      });
    };

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('pointerdown', () => {
        prepareVideo(video);
      });

      video.addEventListener('play', () => {
        if (video.dataset.ready !== '1' && !pendingPlay) {
          video.pause();
          play();
        }
      });

      video.addEventListener('playing', () => {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
  });
})();
