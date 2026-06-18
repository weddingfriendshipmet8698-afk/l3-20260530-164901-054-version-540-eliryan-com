(function () {
  var box = document.querySelector('[data-player-box]');
  var video = document.getElementById('movie-player');
  if (!box || !video) {
    return;
  }

  var startButton = box.querySelector('[data-player-start]');
  var toggleButton = box.querySelector('[data-player-toggle]');
  var muteButton = box.querySelector('[data-player-muted]');
  var fullscreenButton = box.querySelector('[data-player-fullscreen]');
  var hlsUrl = video.getAttribute('data-hls');
  var hlsInstance = null;
  var ready = false;

  function prepare() {
    if (ready || !hlsUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(hlsUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = hlsUrl;
    }
    ready = true;
  }

  function play() {
    prepare();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function toggle() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  function updateState() {
    var isPlaying = !video.paused && !video.ended;
    box.classList.toggle('is-playing', isPlaying);
    if (startButton) {
      startButton.classList.toggle('is-hidden', isPlaying);
    }
    if (toggleButton) {
      toggleButton.textContent = isPlaying ? '暂停' : '播放';
    }
    if (muteButton) {
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    }
  }

  if (startButton) {
    startButton.addEventListener('click', play);
  }

  if (toggleButton) {
    toggleButton.addEventListener('click', toggle);
  }

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      updateState();
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (box.requestFullscreen) {
        box.requestFullscreen();
      }
    });
  }

  video.addEventListener('click', toggle);
  video.addEventListener('play', updateState);
  video.addEventListener('pause', updateState);
  video.addEventListener('ended', updateState);
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
  updateState();
})();
