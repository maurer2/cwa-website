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

    // activate main content section of hash in url on faq page
    if (isFaqPage) {
        const { hash } = window.location;
        const headlines = Array.from(document.querySelectorAll('.headline'))

        if (!headlines.length) {
            return
        }

        const activeHeadline = headlines.filter((element) => `#${element.id}` === hash)
        const inActiveHeadlines = headlines.filter((element) => `#${element.id}` !== hash)

        inActiveHeadlines.forEach((element) => element.classList.remove('active'))
        activeHeadline.forEach((element) => element.classList.add('active'))
    }

    // activate side menu during scroll
    if (isFaqPage) {
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

    // slick slider - requires jQuery
    if (isHomepage) {
        const slider = $('.js-slider')

        slider.slick({
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
    }

    // scroll overlay in bottom of page for app stores
    if (isHomepage) {
        const stickySection = document.querySelector('.js-section-sticky')
        const stickyClose = document.querySelector('.js-section-close')

        if (stickySection){
            const autoHideSticky = function(){
                const top = window.scrollY
                const maxTop = window.innerHeight / 4;

                if (stickySection.classList.contains('invisible')) {
                    if (top < maxTop) {
                        stickySection.classList.remove('invisible');
                    }
                } else {
                    if (top > maxTop) {
                        stickySection.classList.add('invisible');
                    }
                }
            }
            const throttledAutoHideSticky = throttle(autoHideSticky, 500)

            document.addEventListener('scroll', throttledAutoHideSticky)

            stickyClose.addEventListener('click', () => {
                document.removeEventListener('scroll', throttledAutoHideSticky)
                stickySection.classList.add('hidden');
            });

            stickySection.classList.remove('hidden');
        }
    }

    // function to update the faq list for a given searchString
    if (isFaqPage) {
        const updateResults = function(searchString, faq) {
            // result are two arrays, the elements to hide and the ones to show
            const hide = [];
            const show = [];

            // Yeah, slow. But in the end, this is only 50-100 entries
            Object.keys(faq).forEach((anchor) => {
                let text = faq[anchor];
                let anchorDiv = "div[id='" + anchor + "-div']"
                // text and header does not match or the search string is empty
                if(searchString.length === 0 || text.search(searchString) !== -1) {
                    show.push(anchorDiv);
                } else {
                    hide.push(anchorDiv);
                }
            });

            // show all matches
            if (show.length > 0) {
                document.querySelectorAll(show).forEach((div) => {
                    $(div).show({duration: 300});
                });
            }

            // hide everything that does not match
            if (hide.length > 0) {
                document.querySelectorAll(hide).forEach((div) => {
                    $(div).hide({duration: 300});
                });
            };

            // update the total count of results
            let totalCount = (show.length + hide.length).toString();
            let sCount = show.length.toString().padStart(totalCount.length, "0");
            document.getElementById("match-count").innerHTML = sCount + "/" + totalCount;
        }

        // check if the faq-search text field is present
        let searchField = document.getElementById("faq-search");
        if(searchField !== null){
            let faq = {};
            // determine the right filename suffix based on the path
            let lang = window.location.pathname.slice(0,3);
            let fn = "faq" + (lang === "/de" ? "_de" : "") + ".json";

            // do an AJAX call to get the right FAQ document
            $.get("/assets/data/" + fn, (data) => {
                faq = data;
                let faqCount = Object.keys(data).length.toString();
                document.getElementById("match-count").innerHTML = faqCount + "/" + faqCount;

                // find out whether there are search strings added
                var urlParams = new URLSearchParams(window.location.search);
                if(urlParams.has("search")){
                    updateResults(urlParams.get("search"), faq);
                }
            });

            searchField.addEventListener("keyup", (event) => {
                const curSearch = event.target.value.toLowerCase();
                // only search for longer terms and react to empty search (aka delete input)
                if(curSearch.length < 2 && curSearch.length > 0) {
                    return;
                }
                updateResults(curSearch, faq);
            });
        }
    }
});
