
// ─── ab-intro video popup ───
// Opens .video-popup.is-active on [turno-built] click,
// swaps the video src to the attribute value of [turno-built],
// and closes on [close-video-popup] click.
(function () {
    const popup = document.querySelector('.video-popup');
    const trigger = document.querySelector('[turno-built]');
    if (!popup || !trigger) return;

    const videoEl = popup.querySelector('video');
    const source = videoEl && videoEl.querySelector('source');

    // Snapshot the original src so we can restore it on close
    const originalSrc = source ? source.getAttribute('src') : null;

    // Try to find a Plyr instance bound to the video element
    function getPlyr() {
        return videoEl && videoEl._plyr ? videoEl._plyr : null;
    }

    function loadSrc(src) {
        const plyr = getPlyr();
        if (plyr && typeof plyr.source === 'object') {
            // Plyr API: swap source
            plyr.source = {
                type: 'video',
                sources: [{ src: src, type: 'video/mp4' }],
            };
        } else if (source && videoEl) {
            // Fallback: update the <source> and reload
            source.setAttribute('src', src);
            videoEl.load();
        }
    }

    function openPopup() {
        const src = trigger.getAttribute('turno-built');
        if (!src) return;
        loadSrc(src);
        popup.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        popup.classList.remove('is-active');
        document.body.style.overflow = '';

        // Pause video
        const plyr = getPlyr();
        if (plyr) {
            plyr.pause();
        } else if (videoEl) {
            videoEl.pause();
        }

        // Restore original src
        if (originalSrc) loadSrc(originalSrc);
    }

    // Open
    trigger.addEventListener('click', openPopup);

    // Close via any [close-video-popup] element
    popup.querySelectorAll('[close-video-popup]').forEach(function (el) {
        el.addEventListener('click', closePopup);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && popup.classList.contains('is-active')) {
            closePopup();
        }
    });
})();
