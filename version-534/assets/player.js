(function () {
    function attachStream(video, url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hlsPlayer = hls;
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }
        video.src = url;
        return Promise.resolve();
    }

    window.setupMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        if (!video || !overlay || !options.url) {
            return;
        }
        var prepared = false;
        function startPlayback() {
            var work = prepared ? Promise.resolve() : attachStream(video, options.url);
            prepared = true;
            work.then(function () {
                overlay.classList.add("is-hidden");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            });
        }
        overlay.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!prepared) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
    };
})();
