
(function () {
    function render(el) {
        const count = parseInt(el.getAttribute('diagonal-line-hor'), 10);
        if (!count || count < 1) return;

        const h = el.offsetHeight || 40;
        const angleDeg = 45;                                 // line angle from horizontal
        const slant = h / Math.tan(angleDeg * Math.PI / 180); // horizontal run of one line
        const gap = slant * 0.9;                            // spacing between line starts (tweak: 0.4 tighter, 1.2 looser)
        const totalW = slant + gap * (count - 1);

        let lines = '';
        for (let i = 0; i < count; i++) {
            const x = i * gap;
            lines += `<line x1="${x}" y1="${h}" x2="${x + slant}" y2="0" vector-effect="non-scaling-stroke" />`;
        }

        el.innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" style="display:block;overflow:visible;stroke:currentColor;stroke-width:1.5;">${lines}</svg>`;
    }

    function renderAll() {
        document.querySelectorAll('[diagonal-line-hor]').forEach(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAll);
    } else {
        renderAll();
    }
    window.addEventListener('resize', renderAll);
})();