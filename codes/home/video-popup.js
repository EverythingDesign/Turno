// document.addEventListener('DOMContentLoaded', () => {
//     const video = document.querySelector('.home-hero-video-embed video');
//     if (!video) return;

//     // Init Plyr on the popup video
//     const player = new Plyr(video, {
//         controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
//         hideControls: false,
//         ratio: '16:9',
//     });


//     // Make it accessible globally for your custom buttons
//     window.heroPlyr = player;
//     // if (window.innerWidth >= 1025) {
//     // Auto-play when popup opens (clicking "Play Full Video" cursor on hero)
//     document.querySelector('#home-hero')?.addEventListener('click', () => {
//         document.querySelector('.video-popup')?.classList.add('is-active');
//         setTimeout(() => player.play(), 50);
//     });

//     // Pause on Spacebar key too
//     document.addEventListener('keydown', (e) => {
//         if (e.code === 'Space') player.pause();
//     });
//     // } else {
//     const heroThumbnails = document.querySelectorAll("[home-hero-view-video]");
//     heroThumbnails.forEach((heroThumbnail) => {
//         heroThumbnail?.addEventListener("click", () => {
//             const videoPopup = document.querySelector('.video-popup');
//             if (!videoPopup.classList.contains("is-active")) {
//                 videoPopup.classList.add('is-active');
//             }
//             setTimeout(() => player.play(), 50);
//         });
//     })

//     // }

//     const closeVidBtns = document.querySelectorAll("[close-video-popup]");

//     // Pause + reset when close button clicked
//     closeVidBtns.forEach(closeVidBtn => {
//         closeVidBtn?.addEventListener('click', () => {
//             player.pause();
//             player.currentTime = 0;
//             document.querySelector('.video-popup')?.classList.remove('is-active');
//         });
//     });
// });
document.addEventListener('DOMContentLoaded', () => {
    const embedContainer = document.querySelector('.home-hero-video-embed');
    const videoPopup = document.querySelector('.video-popup');

    if (!embedContainer || !videoPopup) return;

    // Helper to handle loading/playing the iframe video from attributes
    const playVideoFromTrigger = (trigger, attributeName) => {
        const iframeHtml = trigger.getAttribute(attributeName);
        if (iframeHtml) {
            // Parse the new iframe
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = iframeHtml;
            const newIframe = tempDiv.querySelector('iframe');
            let newSrc = newIframe ? newIframe.getAttribute('src') : '';

            // Ensure autoplay=1 is in the src URL
            if (newIframe && newSrc && !newSrc.includes('autoplay=')) {
                newSrc += (newSrc.includes('?') ? '&' : '?') + 'autoplay=1';
                newIframe.setAttribute('src', newSrc);
            }

            const currentIframe = embedContainer.querySelector('iframe');
            const currentSrc = currentIframe ? currentIframe.getAttribute('src') : '';

            if (newSrc && currentIframe && currentSrc === newSrc) {
                // Same iframe, just play it
                currentIframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
            } else {
                // Different iframe or none exists, append it
                if (newIframe) {
                    // Force iframe to be 100% width and height of the container
                    newIframe.setAttribute('width', '100%');
                    newIframe.setAttribute('height', '100%');
                    newIframe.style.width = '100%';
                    newIframe.style.height = '100%';
                }
                embedContainer.innerHTML = tempDiv.innerHTML;

                // Play the video when loaded as fallback
                const iframeEl = embedContainer.querySelector('iframe');
                if (iframeEl) {
                    iframeEl.addEventListener('load', () => {
                        iframeEl.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
                    });
                }
            }

            // After that add .is-active to videoPopup
            if (!videoPopup.classList.contains("is-active")) {
                videoPopup.classList.add('is-active');
            }
        }
    };

    // Trigger for hero thumbnails
    const heroThumbnails = document.querySelectorAll("[home-hero-view-video]");
    heroThumbnails.forEach((heroThumbnail) => {
        heroThumbnail?.addEventListener("click", () => {
            playVideoFromTrigger(heroThumbnail, 'home-hero-view-video');
        });
    });

    // Trigger for the home-hero section (only active for screen > 1024)
    const homeHeroes = document.querySelectorAll("[home-hero]");
    homeHeroes.forEach((homeHero) => {
        homeHero?.addEventListener("click", () => {
            if (window.innerWidth > 1024) {
                playVideoFromTrigger(homeHero, 'home-hero');
            }
        });
    });

    const closeVidBtns = document.querySelectorAll("[close-video-popup]");

    // Stop/pause video and reset popup state when close button clicked
    closeVidBtns.forEach(closeVidBtn => {
        closeVidBtn?.addEventListener('click', () => {
            videoPopup.classList.remove('is-active');
            const iframe = embedContainer.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
            }
        });
    });

    // Also pause the video if the popup's is-active class is removed by any other action
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isActive = videoPopup.classList.contains('is-active');
                if (!isActive) {
                    const iframe = embedContainer.querySelector('iframe');
                    if (iframe) {
                        iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
                    }
                }
            }
        });
    });
    observer.observe(videoPopup, { attributes: true });
});