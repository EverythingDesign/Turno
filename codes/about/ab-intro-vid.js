// ─── ab-intro video popup ───
// Opens .video-popup.is-active on [turno-built] click,
// swaps/injects the iframe from the attribute value of [turno-built],
// and closes/pauses on [close-video-popup] click or Escape key.
document.addEventListener('DOMContentLoaded', () => {
    const embedContainer = document.querySelector('.home-hero-video-embed');
    const videoPopup = document.querySelector('.video-popup');

    if (!embedContainer || !videoPopup) return;

    const triggers = document.querySelectorAll("[turno-built]");
    triggers.forEach((trigger) => {
        trigger?.addEventListener("click", () => {
            const iframeHtml = trigger.getAttribute('turno-built');
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

                // After that add .is-active to videoPopup and disable page scroll
                if (!videoPopup.classList.contains("is-active")) {
                    videoPopup.classList.add('is-active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });

    const closeVidBtns = document.querySelectorAll("[close-video-popup]");

    // Stop/pause video and reset popup state when close button clicked
    closeVidBtns.forEach(closeVidBtn => {
        closeVidBtn?.addEventListener('click', () => {
            videoPopup.classList.remove('is-active');
            document.body.style.overflow = '';
            const iframe = embedContainer.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoPopup.classList.contains('is-active')) {
            videoPopup.classList.remove('is-active');
            document.body.style.overflow = '';
            const iframe = embedContainer.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
            }
        }
    });

    // Also pause the video/restore scroll if the popup's is-active class is removed by any other action
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isActive = videoPopup.classList.contains('is-active');
                if (!isActive) {
                    document.body.style.overflow = '';
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
