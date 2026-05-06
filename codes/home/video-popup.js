document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.home-hero-video-embed video');
    if (!video) return;

    // Init Plyr on the popup video
    const player = new Plyr(video, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        hideControls: false,
        ratio: '16:9',
    });

    // Make it accessible globally for your custom buttons
    window.heroPlyr = player;

    // Auto-play when popup opens (clicking "Play Full Video" cursor on hero)
    document.querySelector('#home-hero')?.addEventListener('click', () => {
        document.querySelector('.video-popup')?.classList.add('is-active');
        setTimeout(() => player.play(), 50);
    });
    const closeVidBtns = document.querySelectorAll("[close-video-popup]");

    // Pause + reset when close button clicked
    closeVidBtns.forEach(closeVidBtn => {
        closeVidBtn?.addEventListener('click', () => {
            player.pause();
            player.currentTime = 0;
            document.querySelector('.video-popup')?.classList.remove('is-active');
        });
    })


    // Pause on Escape key too
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') player.pause();
    });
});