(function () {
  'use strict';

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = $('[data-mobile-menu-button]');
    var menu = $('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var root = $('[data-hero-slider]');

    if (!root) {
      return;
    }

    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupCardFilters() {
    var panel = $('[data-card-filter-panel]');
    var grid = $('[data-filter-grid]');
    var result = $('[data-filter-result]');

    if (!panel || !grid) {
      return;
    }

    var queryInput = $('[data-filter-query]', panel);
    var yearSelect = $('[data-filter-year]', panel);
    var regionSelect = $('[data-filter-region]', panel);
    var cards = $all('[data-movie-card]', grid);

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute('data-search') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = '共 ' + visibleCount + ' 部影片';
      }
    }

    [queryInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function initializeHlsPlayer(shell) {
    var video = $('.js-hls-player', shell);
    var message = $('[data-player-message]', shell);
    var source = video ? video.getAttribute('data-src') : '';

    if (!video || !source) {
      return Promise.reject(new Error('播放器缺少视频源'));
    }

    if (shell.getAttribute('data-player-ready') === 'true') {
      return Promise.resolve();
    }

    shell.setAttribute('data-player-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve, reject) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (message) {
              message.textContent = '播放源加载失败，请刷新页面后重试。';
            }
            reject(new Error('HLS 播放源加载失败'));
          }
        });
      });
    }

    if (message) {
      message.textContent = '当前浏览器不支持 m3u8 播放，请更换现代浏览器。';
    }

    return Promise.reject(new Error('当前浏览器不支持 m3u8 播放'));
  }

  function setupPlayers() {
    $all('[data-player-shell]').forEach(function (shell) {
      var start = $('[data-player-start]', shell);
      var video = $('.js-hls-player', shell);
      var message = $('[data-player-message]', shell);

      if (!start || !video) {
        return;
      }

      function play() {
        start.classList.add('is-loading');
        if (message) {
          message.textContent = '正在加载播放源...';
        }

        initializeHlsPlayer(shell)
          .then(function () {
            return video.play();
          })
          .then(function () {
            start.classList.add('is-hidden');
            if (message) {
              message.textContent = '';
            }
          })
          .catch(function () {
            start.classList.remove('is-loading');
            if (message && !message.textContent) {
              message.textContent = '浏览器阻止了自动播放，请再次点击播放按钮。';
            }
          });
      }

      start.addEventListener('click', play);
      video.addEventListener('play', function () {
        start.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          start.classList.remove('is-hidden');
        }
      });
    });
  }

  function setupWatchButton() {
    var button = $('[data-scroll-watch]');
    var shell = $('[data-player-shell]');

    if (!button || !shell) {
      return;
    }

    button.addEventListener('click', function () {
      window.setTimeout(function () {
        var start = $('[data-player-start]', shell);
        if (start) {
          start.click();
        }
      }, 180);
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
      '  <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '">' +
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '    <span class="movie-card__play">立即观看</span>' +
      '  </a>' +
      '  <div class="movie-card__body">' +
      '    <div class="movie-card__meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="movie-card__tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span>' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var page = $('[data-search-page]');

    if (!page || !window.SEARCH_DATA) {
      return;
    }

    var input = $('#site-search-input', page);
    var results = $('[data-search-results]', page);
    var summary = $('[data-search-summary]', page);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';

      if (!keyword) {
        results.innerHTML = '';
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }

      var matched = window.SEARCH_DATA.filter(function (movie) {
        return String(movie.search || '').toLowerCase().indexOf(keyword) !== -1;
      });

      summary.textContent = '找到 ' + matched.length + ' 部相关影片。';
      results.innerHTML = matched.slice(0, 240).map(cardTemplate).join('');

      if (matched.length > 240) {
        summary.textContent += ' 当前显示前 240 部，请输入更精确的关键词。';
      }
    }

    if (input) {
      input.addEventListener('input', render);
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilters();
    setupPlayers();
    setupWatchButton();
    setupSearchPage();
  });
})();
