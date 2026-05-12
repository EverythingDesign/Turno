function createTextFade(
    targetSelector,
    triggerElement,
    startColorInp,
    endColorInp,
    triggerStart = "top bottom",
    triggerEnd = "bottom bottom",
    highlightSelector = null
) {
    // let startColor = "#ff942d";
    // let endColor = "#ffffff";
    let startColor = startColorInp;
    let endColor = endColorInp;
    const chars = document.querySelectorAll(`${targetSelector} .char`);
    if (chars.length === 0) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: triggerElement,
            start: triggerStart,
            end: triggerEnd,
            scrub: true,
            onLeave: () => {
                // Adds 'active' class when the scroll animation is finished (if a selector is provided)
                if (highlightSelector) {
                    const highlightElements = document.querySelectorAll(highlightSelector);
                    highlightElements.forEach(el => el.classList.add('is-active'));
                }
            },
            onEnterBack: () => {
                // Removes it if the user scrolls back up (if a selector is provided)
                if (highlightSelector) {
                    const highlightElements = document.querySelectorAll(highlightSelector);
                    highlightElements.forEach(el => el.classList.remove('is-active'));
                }
            }
        },
    });

    tl.to(chars, {
        opacity: 1,
        color: startColor,
        duration: 0.4,
        ease: "power2.inOut",
        stagger: 0.2,
    }).to(
        chars,
        {
            color: endColor,
            duration: 0.3,
            stagger: 0.2,
            ease: "power2.inOut",
        },
        0.3
    );
}

// document.addEventListener('DOMContentLoaded', (event) => {
//     createTextFade('[fade-text-split] .fade-text-animate', '#backed-trigger', '#e9511a', '#1f1d1e', 'top bottom', 'bottom bottom', '.highlight-text');
// });