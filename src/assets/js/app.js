import $ from 'jquery';
import throttle from 'lodash.throttle';
import 'slick-carousel';

window.jQuery = $;

$(document).ready(function(){
    const isHomepage = document.body.classList.contains('page-home')
    const isFaqPage = document.body.classList.contains('page-faq')

    // hamburger menu mobile nav on every page
    document.querySelector('.header').addEventListener('click', (event) => {
        const element = event.target

        const targetSelector = element.dataset.target
        const targetElement = document.querySelector(targetSelector)

        if (!targetElement) {
            return
        }

        targetElement.classList.toggle('active')
    })

    // homepage
    if (isHomepage) {
        // slick slider - requires jQuery
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

        // scroll overlay in bottom of page for app stores
        if (document.querySelector('.js-section-sticky')){
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
    }

    // faq
    if (isFaqPage) {
        // activate main content section of hash in url on faq page
        const { hash } = window.location;
        const headlines = Array.from(document.querySelectorAll('.headline'))

        if (!headlines.length) {
            return
        }

        const activeHeadline = headlines.filter((element) => `#${element.id}` === hash)
        const inActiveHeadlines = headlines.filter((element) => `#${element.id}` !== hash)

        inActiveHeadlines.forEach((element) => element.classList.remove('active'))
        activeHeadline.forEach((element) => element.classList.add('active'))

        // activate entry that was clicked and remove active class from siblings
        const sidebarMenu = document.querySelector('.js-menu .js-scroll-navigate')
        const sidebarMenuEntries = Array.from(document.querySelectorAll('.js-menu .nav-link'))

        if (!!sidebarMenu || !!sidebarMenuEntries) {
            sidebarMenu.addEventListener('click', (event) => {
                const element = event.target

                if (element.matches('.js-menu .nav-link')) {
                    sidebarMenuEntries.forEach((element) => element.classList.remove('active'))
                    element.classList.add('active')
                }
            })
        }

        // activate side menu during scroll
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
    }
});
