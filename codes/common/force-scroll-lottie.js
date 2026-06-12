gsap.registerPlugin(ScrollTrigger);
(function () {
    if (window.matchMedia('(min-width: 1025px)').matches) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (typeof lottie === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Group selector: matches any element with a [lottie-group] attribute.
    // The specific group name and the animation path are read from the element itself.
    const LOTTIE_GROUP_SELECTOR = '[lottie-group]';

    // Returns [start, end] using the first two comma-separated values in lottie-range.
    // Accepts 2+ values, so lottie-range="2,5,11.5" correctly gives [2, 5] on mobile.
    function readRange(el) {
        const attr = el.getAttribute('lottie-range');
        if (!attr) return null;
        const parts = attr.split(',').map((s) => parseFloat(s.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return [parts[0], parts[1]];
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

        const lottiePath = container.getAttribute('lottie-path');
        if (!lottiePath) return;

        const anim = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
            path: lottiePath,
        });

        anim.addEventListener('DOMLoaded', () => {
            anim.setSpeed(3); // 3x speed for mobile
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

    // ——— 1. Dynamic trigger spacer generation ———
    // Rule: N content wraps → N-1 trigger spacers.
    // If no [trigger-group] elements exist in the HTML, spacers are created
    // as plain divs inside .sticky_g_wrap (after the sticky content block).
    function generateTriggerSpacers() {
        const wraps = root.querySelectorAll('.sticky_content_wrap');
        const existingTriggers = [...document.querySelectorAll(TRIGGER_SELECTOR)];

        // Only one (or zero) content wraps — no spacers needed.
        // Remove any default spacer that may already exist in the HTML.
        if (wraps.length < 2) {
            existingTriggers.forEach((el) => el.remove());
            return;
        }

        const triggerCount = wraps.length - 1;

        // ── Case A: an existing [trigger-group] element is available as template
        if (existingTriggers.length > 0) {
            const parent = existingTriggers[0].parentElement;
            existingTriggers.forEach((el) => el.remove());
            for (let i = 0; i < triggerCount; i++) {
                const spacer = existingTriggers[0].cloneNode(true);
                parent.appendChild(spacer);
            }
            return;
        }

        // ── Case B: no template — create minimal spacer divs inside .sticky_g_wrap
        const gWrap = root.querySelector('.sticky_g_wrap');
        if (!gWrap) return;
        for (let i = 0; i < triggerCount; i++) {
            const spacer = document.createElement('div');
            spacer.setAttribute('trigger-group', SECTION_ID);
            spacer.style.cssText = 'height:100vh;width:100%;pointer-events:none;';
            gWrap.appendChild(spacer);
        }
    }

    // ——— 2. Scroll-driven crossfade ———
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

        // Set initial state — only first wrap visible
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

            // 1. Text crossfade — onEnter / onLeaveBack
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

            // 2. Media parallax — scrubbed
            // Only run if both wraps have a non-empty media slot of their own.
            // The first wrap holds the Lottie (#battery-desktop-main), which is
            // already scrubbed by the inline GSAP block — skip it to avoid
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

    // ——— 3. Heading word color split ———
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
                    '+=0.05',
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

    // ——— 4. Lottie scrub — intro + per-trigger time ranges ———
    function parseRange(el, attr) {
        const raw = el && el.getAttribute(attr);
        if (!raw) return null;
        const parts = raw.split(',').map((s) => parseFloat(s.trim()));
        if (parts.some(isNaN) || parts.length === 0) return null;
        return parts;
    }

    function initLottieScroll() {
        const lottieHost = root.querySelector('#battery-desktop-main');
        if (!lottieHost || typeof lottie === 'undefined') return;

        // Wipe any pre-rendered SVG so Lottie has a clean container
        lottieHost.innerHTML = '';

        const lottiePath = lottieHost.getAttribute('lottie-path');
        if (!lottiePath) return;

        // Array of checkpoint seconds: [introStart, introEnd, t1End, t2End, ...]
        // 2 values  → intro only; triggers use their own lottie-range attributes.
        // 3+ values → intro + all trigger ranges encoded in one place.
        const sequence = parseRange(lottieHost, 'lottie-range');
        if (!sequence || sequence.length < 2) return;
        const LOTTIE_INTRO   = [sequence[0], sequence[1]];
        // Pre-built per-trigger ranges derived from host (available when 3+ values)
        const hostTriggerRanges = sequence.length > 2
            ? sequence.slice(1).reduce((acc, v, i, arr) => {
                if (i < arr.length - 1) acc.push([v, arr[i + 1]]);
                return acc;
              }, [])
            : null;

        const anim = lottie.loadAnimation({
            container: lottieHost,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
            path: lottiePath,
        });

        anim.addEventListener('DOMLoaded', () => {
            anim.setSpeed(4);

            const total = anim.totalFrames - 1;
            const fps = anim.frameRate || 60;
            const triggers = document.querySelectorAll(TRIGGER_SELECTOR);
            // seconds → frame index (clamped to total)
            const resolve = (sec) => Math.min(sec * fps, total);

            const playRange = (trigger, range, scrollConfig, opts = {}) => {
                // range is [start, end] or [null, end] (continuation)
                const getStart = range[0] !== null
                    ? () => resolve(range[0])
                    : () => anim.currentFrame;
                const endFrame = resolve(range[1]);

                ScrollTrigger.create(Object.assign({
                    trigger: trigger,
                    onEnter: () => anim.playSegments([getStart(), endFrame], true),
                    // Only reverse if explicitly requested (intro shouldn't
                    // interrupt the main range mid-play)
                    ...(opts.reverseOnLeaveBack && {
                        onLeaveBack: () => anim.playSegments([endFrame, getStart()], true),
                    }),
                }, scrollConfig));
            };

            // Park on the intro's start frame
            anim.goToAndStop(resolve(sequence[0]), true);

            // Intro: from when #battery enters the viewport until it pins.
            playRange(root, LOTTIE_INTRO, {
                start: 'top center',
                end: 'top top',
            }, { reverseOnLeaveBack: false });

            // Per-spacer ranges:
            // If host had 3+ values, those pre-built ranges take priority.
            // Otherwise each trigger spacer reads its own lottie-range attribute
            // (use a single value for continuation, two values for explicit).
            triggers.forEach((trigger, i) => {
                let range;
                if (hostTriggerRanges) {
                    range = hostTriggerRanges[i] ? [hostTriggerRanges[i][0], hostTriggerRanges[i][1]] : null;
                } else {
                    const raw = parseRange(trigger, 'lottie-range');
                    if (!raw) return;
                    range = raw.length === 1 ? [null, raw[0]] : [raw[0], raw[1]];
                }
                if (!range) return;
                playRange(trigger, range, {
                    start: 'top 80%',
                    end: 'top 40%',
                }, { reverseOnLeaveBack: true });
            });
        });
    }

    // ——— Init ———
    generateTriggerSpacers();
    initStickyScroll();
    initHeadingColorSplit();
    initLottieScroll();
})();