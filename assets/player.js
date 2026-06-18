function initSitePlayer(sourceUrl) {
  var video = document.getElementById('video-player');
  var cover = document.getElementById('play-cover');
  if (!video || !sourceUrl) {
    return;
  }
  var attached = false;
  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = sourceUrl;
  }
  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }
  function startPlayback() {
    attachSource();
    var playPromise = video.play();
    hideCover();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }
  if (cover) {
    cover.addEventListener('click', startPlayback);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', hideCover);
}
