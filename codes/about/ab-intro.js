
// ─── Team card mouse parallax ───
// Moves .team_abs between -5% and +5% on X/Y tracking the cursor within .team-card.
// Only active on screens narrower than 992px.
(function () {
    if (!window.matchMedia('(min-width: 992px)').matches) return;

    const cards = document.querySelectorAll('.team-card');


    cards.forEach((card) => {
        const abs = card.querySelector('.team_abs');
        if (!abs) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Normalise 0→1 within the card, then shift to -0.5→0.5
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;

            // Map to ±5% of the element's own dimensions
            gsap.to(abs, {
                xPercent: nx * 10,
                yPercent: ny * 10,
                duration: 0.7,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(abs, {
                xPercent: 0,
                yPercent: 0,
                duration: 0.7,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        });
    });
})();


// ─── ab-intro="1" — entrance animation on page load ───
(function () {
    if (typeof gsap === 'undefined') return;

    const section = document.querySelector('[ab-intro="1"]');
    if (!section) return;

    const chars = section.querySelectorAll('.char');
    if (!chars.length) return;

    const startColor = '#ff4d17';
    gsap.set(chars, { opacity: 0 });

    // Small delay so the browser has painted the initial layout before animating
    document.addEventListener('DOMContentLoaded', () => {
        gsap.timeline({ delay: 0.3 }).to(chars, {
            keyframes: [
                { opacity: 1, color: startColor,   duration: 0.1, ease: 'power2.inOut' },
                { color: 'currentColor',            duration: 0.1, ease: 'power2.inOut' },
            ],
            stagger: 0.03,
        });
    });
})();

// ─── ab-intro 2–5 — char-by-char colour reveal ───

(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const startColor = '#ff4d17';
    const endColor = 'currentColor';

    [2, 3, 4, 5].forEach((n) => {
        const section = document.querySelector(`[ab-intro="${n}"]`);
        if (!section) return;

        const chars = section.querySelectorAll('.char');
        if (!chars.length) {
            console.warn(`ab-intro="${n}": no .char elements found — animation skipped.`);
            return;
        }


        // Hide all chars upfront
        gsap.set(chars, { opacity: 0 });

        let tl = null;

        const play = () => {
            if (tl) tl.kill();
            gsap.set(chars, { opacity: 0 });

            if (n === 5) {
                // Section 5: fade in orange and stay orange
                tl = gsap.timeline().to(chars, {
                    opacity: 1,
                    color: startColor,
                    duration: 0.1,
                    ease: 'power2.inOut',
                    stagger: 0.03,
                });
            } else {
                // Sections 2–4: each char flashes orange then settles to currentColor
                tl = gsap.timeline().to(chars, {
                    keyframes: [
                        { opacity: 1, color: startColor, duration: 0.1, ease: 'power2.inOut' },
                        { color: endColor,               duration: 0.1, ease: 'power2.inOut' },
                    ],
                    stagger: 0.03,
                });
            }
        };


        const reset = () => {
            if (tl) { tl.kill(); tl = null; }
            gsap.set(chars, { opacity: 0 });
        };

        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: play,
            onLeaveBack: reset,
        });
    });
})();