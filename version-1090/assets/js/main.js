document.addEventListener('DOMContentLoaded', function () {
    bindMobileNavigation();
    bindHeroCarousel();
    bindPageSearch();
});

function bindMobileNavigation() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', function () {
        nav.classList.toggle('open');
    });
}

function bindHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    if (slides.length <= 1) {
        return;
    }

    function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(nextIndex);
        });
    });

    window.setInterval(function () {
        showSlide(index + 1);
    }, 5200);
}

function bindPageSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-search]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (!inputs.length || !cards.length) {
        return;
    }

    inputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-year') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                card.classList.toggle('hidden', keyword.length > 0 && text.indexOf(keyword) === -1);
            });
        });
    });
}
