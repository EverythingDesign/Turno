gsap.registerPlugin(ScrollTrigger);
(function () {
    // console.log("fghjklm;,")
    if (window.matchMedia('(min-width: 1025px)').matches) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (typeof lottie === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const LOTTIE_GROUP_SELECTOR = `[lottie-group="battery"]`;
    const LOTTIE_PATH = 'https://cdn.prod.website-files.com/69f0584be4d9dcdc9451abc0/69f445228ba6615487b20bb5_Battery-v1.json';

    function readRange(el, index) {
        const attr = el.getAttribute('lottie-range');
        if (attr) {
            const parts = attr.split(',').map((s) => parseFloat(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                return parts;
            }
        }
        return null;
    }

    const containers = document.querySelectorAll(LOTTIE_GROUP_SELECTOR);
    if (!containers.length) return;

    containers.forEach((container, index) => {
        const range = readRange(container, index);
        if (!range) return;

        // Clear any pre-rendered SVG so Lottie has a clean container
        container.innerHTML = '';

        const anim = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
            path: LOTTIE_PATH,
        });

        anim.addEventListener('DOMLoaded', () => {
            const total = anim.totalFrames - 1;
            const fps = anim.frameRate || 60;
            const toFrame = (sec) => Math.min(sec * fps, total);

            const startFrame = toFrame(range[0]);
            const endFrame = toFrame(range[1]);

            anim.goToAndStop(startFrame, true);

            ScrollTrigger.create({
                trigger: container,
                start: 'top 80%',
                onEnter: () => {
                    anim.setDirection(1);
                    anim.playSegments([startFrame, endFrame], true);
                },
                onLeaveBack: () => anim.goToAndStop(startFrame, true),
            });
        });
    });
})();

(function () {
    if (!window.matchMedia('(min-width: 1025px)').matches) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

    const SECTION_ID = 'battery';
    const TRIGGER_SELECTOR = `[trigger-group="${SECTION_ID}"]`;

    const startColor = '#e9511a';
    const endColor = '#e6e6e6';

    const root = document.getElementById(SECTION_ID);
    if (!root) return;

    // â”€â”€â”€ 1. Dynamic trigger spacer generation â”€â”€â”€
    // Rule: N content wraps â†’ N-1 trigger spacers
    function generateTriggerSpacers() {
        const wraps = root.querySelectorAll('.sticky_content_wrap');
        const existingTrigger = document.querySelector(TRIGGER_SELECTOR);

        if (!existingTrigger || wraps.length < 2) return;

        const triggerCount = wraps.length - 1;
        const parent = existingTrigger.parentElement;

        // Remove all existing trigger spacers first
        parent.querySelectorAll(TRIGGER_SELECTOR).forEach((el) => el.remove());

        // Clone the original trigger N-1 times
        for (let i = 0; i < triggerCount; i++) {
            const spacer = existingTrigger.cloneNode(true);
            parent.appendChild(spacer);
        }
    }

    // â”€â”€â”€ 2. Scroll-driven crossfade â”€â”€â”€
    function initStickyScroll() {
        const wraps = root.querySelectorAll('.sticky_content_wrap');
        const triggers = document.querySelectorAll(TRIGGER_SELECTOR);

        if (wraps.length < 2 || triggers.length === 0) return;

        // Wrapper carries the y-translation; eyebrow .u-text needs its own
        // opacity tween to override the inline CSS rule that hides it on
        // non-first wraps (.sticky_content > :not(:first-child) .u-text).
        const getTextTargets = (wrap) => {
            const left = wrap.querySelector('.sticky_content_left');
            if (!left) return [];
            const wrapper = left.querySelector('.u-content-wrapper');
            const eyebrow = left.querySelector('.u-text');
            return [wrapper, eyebrow].filter(Boolean);
        };

        const getMediaTarget = (wrap) => {
            const right = wrap.querySelector('.sticky_content_right');
            return right ? right.querySelector('.lottie_wrap') : null;
        };

        // Set initial state â€” only first wrap visible
        wraps.forEach((wrap, i) => {
            const targets = getTextTargets(wrap);
            if (targets.length) gsap.set(targets, { opacity: i === 0 ? 1 : 0 });
        });

        triggers.forEach((trigger, i) => {
            const current = wraps[i];
            const next = wraps[i + 1];
            if (!current || !next) return;

            const currentText = getTextTargets(current);
            const nextText = getTextTargets(next);

            // 1. Text crossfade â€” onEnter / onLeaveBack
            ScrollTrigger.create({
                trigger: trigger,
                start: 'top 90%',
                onEnter: () => {
                    gsap.to(currentText, {
                        opacity: 0,
                        y: -10,
                        duration: 0.3,
                        stagger: 0.1,
                        overwrite: true,
                    });
                    gsap.fromTo(
                        nextText,
                        { y: 10 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.3,
                            stagger: 0.1,
                            delay: 0.2,
                            overwrite: true,
                        },
                    );
                },
                onLeaveBack: () => {
                    gsap.to(nextText, {
                        opacity: 0,
                        y: -10,
                        duration: 0.3,
                        stagger: 0.1,
                        overwrite: true,
                    });
                    gsap.to(currentText, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        stagger: 0.1,
                        delay: 0.2,
                        overwrite: true,
                    });
                },
            });

            // 2. Media parallax â€” scrubbed
            // Only run if both wraps have a non-empty media slot of their own.
            // The first wrap holds the Lottie (#battery-desktop-main), which is
            // already scrubbed by the inline GSAP block â€” skip it to avoid
            // transform conflicts.
            const currentMedia = getMediaTarget(current);
            const nextMedia = getMediaTarget(next);
            const lottieHost = root.querySelector('#battery-desktop-main');

            if (currentMedia && nextMedia && currentMedia !== lottieHost && nextMedia !== lottieHost) {
                gsap
                    .timeline({
                        scrollTrigger: {
                            trigger: trigger,
                            start: 'top center',
                            end: 'bottom bottom',
                            scrub: true,
                        },
                    })
                    .to(currentMedia, { y: '-=50%', ease: 'none' }, 0)
                    .to(nextMedia, { y: '0%', ease: 'none' }, 0);
            }
        });
    }

    // â”€â”€â”€ 3. Heading word color split â”€â”€â”€
    function initHeadingColorSplit() {
        if (typeof SplitText === 'undefined') return;

        const wraps = root.querySelectorAll('.sticky_content_wrap');
        const triggers = document.querySelectorAll(TRIGGER_SELECTOR);

        wraps.forEach((wrap) => {
            const heading = wrap.querySelector('.u-heading h2');
            if (!heading) return;
            new SplitText(heading, { types: 'words', wordsClass: 'headWord' });
        });

        const activeTimelines = new Map();

        const playColorIn = (wrap, delayOffset = 0) => {
            const words = wrap.querySelectorAll('.headWord');
            const heading = wrap.querySelector('.u-heading');
            if (!words.length || !heading) return;

            if (activeTimelines.has(wrap)) {
                activeTimelines.get(wrap).kill();
            }

            gsap.set(words, { opacity: 0 });
            const tl = gsap
                .timeline({ delay: delayOffset })
                .to(heading, { opacity: 1, duration: 0 })
                .to(words, {
                    opacity: 1,
                    color: startColor,
                    duration: 0.2,
                    ease: 'power2.inOut',
                    stagger: 0.05,
                })
                .to(
                    words,
                    {
                        color: endColor,
                        duration: 0.2,
                        stagger: 0.05,
                        ease: 'power2.inOut',
                    },
                    0.3,
                );

            activeTimelines.set(wrap, tl);
        };

        const hideHeading = (wrap) => {
            const heading = wrap.querySelector('.u-heading');
            const words = wrap.querySelectorAll('.headWord');
            if (!heading) return;

            if (activeTimelines.has(wrap)) {
                activeTimelines.get(wrap).kill();
                activeTimelines.delete(wrap);
            }

            gsap.set(heading, { opacity: 0 });
            gsap.set(words, { opacity: 0 });
        };

        // Prime the first wrap
        // As requested: the first item does not have any animation and is done by default.
        if (wraps[0]) {
            const heading = wraps[0].querySelector('.u-heading');
            const words = wraps[0].querySelectorAll('.headWord');
            if (heading) gsap.set(heading, { opacity: 1 });
            if (words.length) gsap.set(words, { opacity: 1, color: endColor });
        }

        triggers.forEach((trigger, i) => {
            const current = wraps[i];
            const next = wraps[i + 1];
            if (!current || !next) return;

            // Hide next heading initially to prevent flashes
            hideHeading(next);

            ScrollTrigger.create({
                trigger: trigger,
                start: 'top 90%', // Match the eyebrow's trigger point
                onEnter: () => {
                    hideHeading(current);
                    playColorIn(next, 0.2); // 0.2s delay matches the eyebrow's delay
                },
                onLeaveBack: () => {
                    hideHeading(next);
                    playColorIn(current, 0.2);
                },
            });
        });
    }
    // â”€â”€â”€ 4. Lottie scrub â€” intro + per-trigger time ranges â”€â”€â”€
    // Values are SECONDS into the Lottie animation.
    // INTRO scrubs while the #battery section is entering the viewport,
    // before any spacer-trigger fires. RANGES has one entry per
    // [trigger-group="battery"] spacer, in scroll order.
    // The Lottie sits paused on the last played frame between ranges.
    const LOTTIE_INTRO = [1, 4]; // section in view â†’ 0sâ€“1s
    const LOTTIE_RANGES = [
        [4, 11], // Trigger 2 (3rd tab) â†’ 5sâ€“11s
    ];

    function initLottieScroll() {
        const lottieHost = root.querySelector('#battery-desktop-main');
        if (!lottieHost || typeof lottie === 'undefined') return;

        // Wipe any pre-rendered SVG so Lottie has a clean container
        lottieHost.innerHTML = '';

        const anim = lottie.loadAnimation({
            container: lottieHost,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
            path: 'https://cdn.prod.website-files.com/69f0584be4d9dcdc9451abc0/69f445228ba6615487b20bb5_Battery-v1.json',
        });

        anim.addEventListener('DOMLoaded', () => {
            const total = anim.totalFrames - 1;
            const fps = anim.frameRate || 60;
            const triggers = document.querySelectorAll(TRIGGER_SELECTOR);
            // seconds â†’ frame index (clamped to total)
            const resolve = (sec) => Math.min(sec * fps, total);

            const scrub = (trigger, range, scrollConfig) => {
                const startFrame = resolve(range[0]);
                const endFrame = resolve(range[1]);
                const frame = { v: startFrame };

                gsap.to(frame, {
                    v: endFrame,
                    ease: 'none',
                    scrollTrigger: Object.assign(
                        {
                            trigger: trigger,
                            scrub: 0.5,
                        },
                        scrollConfig,
                    ),
                    onUpdate: () => anim.goToAndStop(frame.v, true),
                });
            };

            // Park on the intro's start frame
            anim.goToAndStop(resolve(LOTTIE_INTRO[0]), true);

            // Intro: from when #battery enters the viewport until it pins.
            // The spacer-triggers sit *after* the sticky content, so this
            // window completes before LOTTIE_RANGES[0] begins.
            scrub(root, LOTTIE_INTRO, {
                start: 'top center',
                end: 'top top',
            });

            // Per-spacer ranges
            triggers.forEach((trigger, i) => {
                const range = LOTTIE_RANGES[i];
                if (!range) return;
                scrub(trigger, range, {
                    start: 'top 80%',
                    end: 'top 40%',
                });
            });
        });
    }

    // â”€â”€â”€ Init â”€â”€â”€
    generateTriggerSpacers();
    initStickyScroll();
    initHeadingColorSplit();
    initLottieScroll();
})();