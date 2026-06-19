import { H as Hls } from './hls-vendor-dru42stk.js';

const players = Array.from(document.querySelectorAll('video[data-video-url]'));

players.forEach(function (video) {
    const source = video.dataset.videoUrl;

    if (!source) {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                return;
            }

            hls.destroy();
        });

        return;
    }

    video.src = source;
});
