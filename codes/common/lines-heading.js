(function () {
    function paintHatch(el) {
        var rect = el.getBoundingClientRect();
        var w = Math.round(rect.width);
        var h = Math.round(rect.height);
        if (!w || !h) return;

        /* skip if dimensions haven't changed — breaks any residual feedback */
        if (el.dataset.hatchW === String(w) && el.dataset.hatchH === String(h)) return;
        el.dataset.hatchW = w;
        el.dataset.hatchH = h;

        var count = Math.max(1, Math.round(h / 20)); // tweak: increase 24 to make looser, decrease to make tighter
        var slot = h / count;
        var extent = Math.min(10, slot * 0.8); // Increased max extent from 5 to 15 for longer lines
        var cx = Math.min(w / 2, 20); // Moved center point further right to accommodate longer lines
        var lines = '';
        for (var i = 0; i < count; i++) {
            var cy = (i + 0.5) * slot;
            lines += '<line x1="' + (cx - extent) + '" y1="' + (cy + extent) + '" x2="' + (cx + extent) + '" y2="' + (cy - extent) + '" stroke="#D85A30" stroke-width="1.5" stroke-linecap="square"/>';
        }
        /* viewBox-based SVG — sizes from CSS, not from intrinsic width/height */
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' + lines + '</svg>';
    }

    function init() {
        document.querySelectorAll('[data-hatch]').forEach(function (el) {
            var raf = null;
            var ro = new ResizeObserver(function () {
                if (raf) return;
                raf = requestAnimationFrame(function () {
                    raf = null;
                    paintHatch(el);
                });
            });
            ro.observe(el);
            paintHatch(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();