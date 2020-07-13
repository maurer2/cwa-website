import $ from 'jquery';
import throttle from 'lodash.throttle';
import 'slick-carousel';

window.jQuery = $;

$(document).ready(function(){
    // hamburger button mobile nav
    document.addEventListener('click', (event) => {
        const element = event.target

        const targetSelector = element.dataset.target
        const targetElement = document.querySelector(targetSelector)

        if (!targetElement) {
            return
        }

        targetElement.classList.toggle('active')
    })

    // activate main content section of hash in url on faq page
    // todo: update url hash on scroll
    if (document.querySelector('.page-faq')) {
        const { hash } = window.location;
        const headlines = Array.from(document.querySelectorAll('.headline'))

        if (!headlines.length) {
            return
        }

        const activeHeadline = headlines.filter((element) => `#${element.id}` === hash)
        const inActiveHeadlines = headlines.filter((element) => `#${element.id}` !== hash)

        // temp
        // activeHeadline.forEach((element) => {
            // element.style['scroll-padding-top'] = '40px'
        // })

        inActiveHeadlines.forEach((element) => { element.classList.remove('active') })
        activeHeadline.forEach((element) => { element.classList.add('active') })
    }

    // activate entry that was clicked and remove from siblings on faq page
    $('.js-menu .js-scroll-navigate a').on('click tap', function(){
        $(this).parents('.js-menu').first().removeClass('active');
        $(this).parents('.js-menu').first().find('a').removeClass('active');
        $(this).addClass('active');
    });

    // activate side menu on faq page during scroll
    const anchors = Array.from(document.querySelectorAll('.js-anchor'));
    const menu = document.querySelector('.js-scroll-navigate');

    const handleScrollFAQMenu = function() {
        if (!anchors.length) {
            return
        }

        const negativeOffsets = anchors
            .map((anchor) => Math.floor(anchor.getBoundingClientRect().top))
            .filter(offset => offset <= 0);
        const current = negativeOffsets.indexOf(Math.max(...negativeOffsets));

        if (current >= 0) {
            const hash = '#' + anchors[current].id;

            const oldItem = menu.querySelector('a.active');
            const newItem = menu.querySelector('a[href="' + hash + '"]');

            if (newItem !== null && oldItem !== null) {
                oldItem.classList.remove('active');
                newItem.classList.add('active');
            }
        }
    };
    const throttledHandleScrollFAQMenu = throttle(handleScrollFAQMenu, 500)
    document.addEventListener('scroll', throttledHandleScrollFAQMenu)

    // slick slider
    $('.js-slider').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [{
            breakpoint : 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });

    // sticky overlay for app stores
    if ($('.js-section-sticky').index() >= 0){
        const autoHideSticky = function(){
            const top = $(document).scrollTop(),
                maxTop = $(window).height() / 4;
            if ($('.js-section-sticky').hasClass('invisible')) {
                if (top < maxTop) {
                    $('.js-section-sticky').removeClass('invisible');
                }
            } else {
                if (top > maxTop) {
                    $('.js-section-sticky').addClass('invisible');
                }
            }
        }
        const throttledAutoHideSticky = throttle(autoHideSticky, 500)
        document.addEventListener('scroll', throttledAutoHideSticky)

        $('.js-section-close').on('click tap', function(){
            $(this).parents('section').first().addClass('hidden');
            $(document).off('scroll', throttledAutoHideSticky);
        });
        $('.js-section-sticky').removeClass('hidden');
    }
});
