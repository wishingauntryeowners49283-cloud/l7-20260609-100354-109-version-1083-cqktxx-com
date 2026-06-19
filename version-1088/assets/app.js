(function () {
    var menuButton = document.getElementById("mobileMenuButton");
    var mobilePanel = document.getElementById("mobilePanel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle("is-active", itemIndex === currentSlide);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle("is-active", itemIndex === currentSlide);
        });
    }

    function restartSlides() {
        if (slideTimer) {
            window.clearInterval(slideTimer);
        }

        if (slides.length > 1) {
            slideTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(currentSlide - 1);
            restartSlides();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(currentSlide + 1);
            restartSlides();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            restartSlides();
        });
    });

    showSlide(0);
    restartSlides();

    var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyMessage = document.querySelector("[data-empty-message]");
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || params.get("search") || "";
    var activeCategory = "all";
    var activeYear = "all";

    function setSearchValue(value) {
        searchInputs.forEach(function (input) {
            input.value = value;
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInputs[0] ? searchInputs[0].value : initialQuery);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-text"));
            var title = normalize(card.getAttribute("data-title"));
            var year = card.getAttribute("data-year") || "";
            var category = card.getAttribute("data-category") || "";
            var matchesQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
            var matchesCategory = activeCategory === "all" || category === activeCategory;
            var matchesYear = activeYear === "all" || year === activeYear;
            var show = matchesQuery && matchesCategory && matchesYear;

            card.classList.toggle("is-hidden", !show);

            if (show) {
                visible += 1;
            }
        });

        if (emptyMessage) {
            emptyMessage.classList.toggle("is-visible", visible === 0);
        }
    }

    setSearchValue(initialQuery);
    applyFilters();

    searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            setSearchValue(input.value);
            applyFilters();
        });
    });

    searchForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("[data-search-input]");
            var value = input ? input.value.trim() : "";

            if (cards.length) {
                event.preventDefault();
                setSearchValue(value);
                applyFilters();

                if (window.history && window.history.replaceState) {
                    var url = value ? window.location.pathname + "?q=" + encodeURIComponent(value) + "#library" : window.location.pathname + "#library";
                    window.history.replaceState(null, "", url);
                }
            }
        });
    });

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeCategory = button.getAttribute("data-filter-category") || "all";
            categoryButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyFilters();
        });
    });

    yearButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeYear = button.getAttribute("data-filter-year") || "all";
            yearButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyFilters();
        });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
        var video = player.querySelector("video");
        var trigger = player.querySelector("[data-play-trigger]");
        var streamUrl = player.getAttribute("data-stream");
        var ready = false;

        function prepareVideo() {
            if (ready || !video || !streamUrl) {
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                player._hls = hls;
                return;
            }

            video.src = streamUrl;
        }

        function startVideo() {
            prepareVideo();

            if (trigger) {
                trigger.classList.add("is-hidden");
            }

            if (video) {
                video.setAttribute("controls", "controls");
                var playback = video.play();

                if (playback && playback.catch) {
                    playback.catch(function () {});
                }
            }
        }

        if (trigger) {
            trigger.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startVideo();
                }
            });
        }
    });
})();
