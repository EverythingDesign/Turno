document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('#home-hero');
    const bounds = section?.querySelector('.cursor-bounds');
    const wrap = bounds?.querySelector('.cursor_wrap');
    if (!section || !bounds || !wrap) return;

    gsap.set(wrap, {
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        scale: 0.85,
    });

    const xTo = gsap.quickTo(wrap, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(wrap, 'y', { duration: 0.45, ease: 'power3' });

    let visible = false;

    const onMove = (e) => {
        const r = bounds.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        xTo(x);
        yTo(y);

        if (!visible) {
            gsap.set(wrap, { x, y });
            gsap.to(wrap, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
            visible = true;
        }
    };

    const onLeave = () => {
        gsap.to(wrap, { opacity: 0, scale: 0.85, duration: 0.25, ease: 'power2.out' });
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