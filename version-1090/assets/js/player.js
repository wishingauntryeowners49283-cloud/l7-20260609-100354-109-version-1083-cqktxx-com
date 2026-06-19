document.addEventListener('DOMContentLoaded', function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-overlay]');
        var source = player.getAttribute('data-video-src');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (video.getAttribute('data-source-attached') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute('data-source-attached', 'true');
        }

        function playVideo() {
            attachSource();
            player.classList.add('playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.remove('playing');
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                player.classList.remove('playing');
            }
        });

        video.addEventListener('ended', function () {
            player.classList.remove('playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
});
