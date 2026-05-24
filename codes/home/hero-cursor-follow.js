document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('#home-hero');
    const bounds = section?.querySelector('.cursor-bounds');
    const wrap = bounds?.querySelector('.cursor_wrap');
    if (!section || !bounds || !wrap) return;

    const xTo = gsap.quickTo(wrap, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(wrap, 'y', { duration: 0.45, ease: 'power3' });

    let visible = false;
    let idleTimer;

    const onMove = (e) => {
        wrap.classList.remove('is-idle');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            wrap.classList.add('is-idle');
        }, 150); // Adds glow class after 150ms of no movement

        const r = bounds.getBoundingClientRect();
        const x = e.clientX - r.left - wrap.offsetLeft;
        const y = e.clientY - r.top - wrap.offsetTop;

        xTo(x);
        yTo(y);

        if (!visible) {
            gsap.set(wrap, { x, y });
            gsap.to(wrap, { duration: 0.3, ease: 'power2.out' });
            visible = true;
        }
    };

    const onLeave = () => {
        clearTimeout(idleTimer);
        wrap.classList.add('is-idle'); // ensure it glows when resting
        visible = false;
    };

    const mq = window.matchMedia('(min-width: 992px)');

    const apply = (matches) => {
        if (matches) {
            section.addEventListener('mousemove', onMove);
            section.addEventListener('mouseleave', onLeave);
        } else {
            section.removeEventListener('mousemove', onMove);
            section.removeEventListener('mouseleave', onLeave);
            gsap.set(wrap, { opacity: 0, scale: 0.85 });
            visible = false;
        }
    };

    apply(mq.matches);
    mq.addEventListener('change', (e) => apply(e.matches));
});