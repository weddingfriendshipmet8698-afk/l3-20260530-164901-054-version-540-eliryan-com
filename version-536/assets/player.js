(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll(".player-wrap").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var button = box.querySelector(".player-start");
      var streamUrl = video ? video.getAttribute("data-stream") : "";
      var hlsInstance = null;
      var prepared = false;

      function attachStream() {
        if (!video || !streamUrl || prepared) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          prepared = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          prepared = true;
          return;
        }

        video.src = streamUrl;
        prepared = true;
      }

      function startPlayback() {
        attachStream();
        box.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", startPlayback);
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          startPlayback();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
