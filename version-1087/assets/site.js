(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function setupLocalFilters() {
    var toolbars = selectAll('[data-filter-scope]');
    toolbars.forEach(function (toolbar) {
      var target = document.querySelector(toolbar.getAttribute('data-filter-scope'));
      if (!target) {
        return;
      }
      var input = toolbar.querySelector('[data-filter-keyword]');
      var type = toolbar.querySelector('[data-filter-type]');
      var region = toolbar.querySelector('[data-filter-region]');
      var year = toolbar.querySelector('[data-filter-year]');
      var cards = selectAll('[data-movie-card]', target);
      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
            matched = false;
          }
          if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
            matched = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
            matched = false;
          }
          card.classList.toggle('is-hidden-by-filter', !matched);
        });
      }
      [input, type, region, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
    });
  }

  function setupGlobalSearch() {
    var forms = selectAll('[data-global-search]');
    var index = window.SEARCH_INDEX || [];
    forms.forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var results = form.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }
      function render() {
        var keyword = normalize(input.value);
        if (!keyword) {
          results.classList.remove('is-open');
          results.innerHTML = '';
          return;
        }
        var matched = index.filter(function (item) {
          var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags].join(' '));
          return text.indexOf(keyword) !== -1;
        }).slice(0, 8);
        results.innerHTML = matched.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
            '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.type + ' · ' + item.year + '</span></span>' +
            '</a>';
        }).join('');
        results.classList.toggle('is-open', matched.length > 0);
      }
      input.addEventListener('input', render);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var first = results.querySelector('a');
        if (first) {
          window.location.href = first.getAttribute('href');
        }
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          results.classList.remove('is-open');
        }
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-video-url');
    var hlsInstance = null;
    function attachSource() {
      if (!url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', url);
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
    }
    function playMovie() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', playMovie);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
    setupPlayer();
  });
})();
