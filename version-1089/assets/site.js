(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    if (slides.length > 1) {
      play();
    }
  }

  function initCatalogFilters() {
    var tools = document.querySelector('[data-catalog-tools]');
    var grid = document.querySelector('[data-catalog-grid]');
    if (!tools || !grid) {
      return;
    }
    var search = tools.querySelector('[data-catalog-search]');
    var typeButtons = Array.prototype.slice.call(tools.querySelectorAll('[data-type-filter]'));
    var yearButtons = Array.prototype.slice.call(tools.querySelectorAll('[data-year-filter]'));
    var activeType = 'all';
    var activeYear = 'all';

    function filter() {
      var query = search ? search.value.trim().toLowerCase() : '';
      Array.prototype.slice.call(grid.querySelectorAll('[data-title]')).forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = activeType === 'all' || card.dataset.type === activeType;
        var matchYear = activeYear === 'all' || card.dataset.year === activeYear;
        card.hidden = !(matchQuery && matchType && matchYear);
      });
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.dataset.typeFilter;
        typeButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        filter();
      });
    });
    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.dataset.yearFilter;
        yearButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        filter();
      });
    });
    if (search) {
      search.addEventListener('input', filter);
    }
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var heading = document.querySelector('[data-search-heading]');
    if (input) {
      input.value = query;
    }
    if (heading) {
      heading.textContent = query ? '搜索：' + query : '搜索影片';
    }
    var q = query.toLowerCase();
    var data = window.SEARCH_MOVIES.filter(function (movie) {
      if (!q) {
        return true;
      }
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.line,
        movie.summary
      ].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = data.map(function (movie) {
      return [
        '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '">',
        '<span class="poster-frame">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">',
        '<span class="poster-shade"></span>',
        '<span class="card-badge">' + escapeHtml(movie.type) + '</span>',
        '<span class="card-play">▶</span>',
        '</span>',
        '<span class="movie-card-body">',
        '<strong>' + escapeHtml(movie.title) + '</strong>',
        '<small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(String(movie.year)) + '</small>',
        '<span>' + escapeHtml(movie.line) + '</span>',
        '</span>',
        '</a>'
      ].join('');
    }).join('');
    if (!data.length) {
      results.innerHTML = '<p class="category-desc">未找到相关影片。</p>';
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (frame) {
      var video = frame.querySelector('video');
      var button = frame.querySelector('[data-play-button]');
      var hlsInstance;
      if (!video || !button) {
        return;
      }

      function attach() {
        if (video.dataset.ready === '1') {
          return;
        }
        var streamUrl = video.dataset.stream;
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
        video.dataset.ready = '1';
      }

      function start() {
        attach();
        button.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', start);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCatalogFilters();
    initSearchPage();
    initPlayers();
  });
}());
