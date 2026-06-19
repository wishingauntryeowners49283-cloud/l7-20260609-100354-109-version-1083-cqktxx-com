(function () {
    const body = document.body;
    const root = body ? body.dataset.root || './' : './';

    function withRoot(path) {
        return root + String(path || '').replace(/^\/+/, '');
    }

    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.main-nav');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function () {
            const isOpen = navigation.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let activeIndex = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length <= 1) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            const target = Number(dot.dataset.slideTarget || 0);
            showSlide(target);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
            }
            startHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    const searchInput = document.getElementById('globalSearchInput');
    const searchResults = document.getElementById('globalSearchResults');
    const searchItems = Array.isArray(window.siteSearchItems) ? window.siteSearchItems : [];

    function closeSearch() {
        if (searchResults) {
            searchResults.classList.remove('is-open');
        }
    }

    function createSearchItem(item) {
        const link = document.createElement('a');
        link.className = 'search-result-item';
        link.href = withRoot(item.url);

        const image = document.createElement('img');
        image.src = withRoot(item.cover);
        image.alt = item.title;
        image.loading = 'lazy';

        const textWrap = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = item.title;

        const meta = document.createElement('span');
        meta.textContent = [item.region, item.type, item.year ? item.year + '年' : ''].filter(Boolean).join(' · ');

        textWrap.appendChild(title);
        textWrap.appendChild(meta);
        link.appendChild(image);
        link.appendChild(textWrap);

        return link;
    }

    function renderSearch(query) {
        if (!searchResults) {
            return;
        }

        searchResults.textContent = '';

        const keyword = query.trim().toLowerCase();
        if (!keyword) {
            closeSearch();
            return;
        }

        const matches = searchItems.filter(function (item) {
            return String(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.year).toLowerCase().includes(keyword);
        }).slice(0, 12);

        if (!matches.length) {
            const empty = document.createElement('div');
            empty.className = 'search-empty';
            empty.textContent = '未找到相关影片';
            searchResults.appendChild(empty);
        } else {
            matches.forEach(function (item) {
                searchResults.appendChild(createSearchItem(item));
            });
        }

        searchResults.classList.add('is-open');
    }

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function () {
            renderSearch(searchInput.value);
        });

        document.addEventListener('click', function (event) {
            if (!searchResults.contains(event.target) && event.target !== searchInput) {
                closeSearch();
            }
        });

        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeSearch();
                searchInput.blur();
            }
        });
    }
})();
