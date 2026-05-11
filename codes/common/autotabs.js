/**** AUTO TAB COMPONENT ****/
/**** AUTO TAB COMPONENT ****/

class AutoTab {
    /**
     * @param {string} sectionId  ID of the section that contains a .tab-component
     * @param {number} duration   Time per tab, in milliseconds
     * @param {string} hoverSelector Optional specific element selector to pause on hover
     */
    constructor(sectionId, duration = 4000, hoverSelector = null) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const tabComponent = section.querySelector('.tab-component');
        if (!tabComponent) return;

        this.tabs = Array.from(tabComponent.querySelectorAll('.tab-btn'));
        const contentWrap = tabComponent.querySelector('.tab-component-content_wrap');
        this.contents = contentWrap ? Array.from(contentWrap.children) : [];
        if (!this.tabs.length || !this.contents.length) return;

        // Optional per-tab progress line (.tab-active-line nested in .tab-btn)
        this.lines = this.tabs.map((t) => t.querySelector('.tab-active-line'));

        this.count = Math.min(this.tabs.length, this.contents.length);
        this.duration = duration;
        this.activeIndex = 0;
        this.tween = null;
        this.paused = true; // Start paused, observer will resume it

        let hoverTargets = [tabComponent];
        if (hoverSelector) {
            let elements = section.querySelectorAll(hoverSelector);
            if (!elements.length) elements = document.querySelectorAll(hoverSelector);
            if (elements.length) hoverTargets = Array.from(elements);
        }

        this.bindEvents(hoverTargets);
        this.activate(0);

        // Intersection Observer to only play when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.resume();
                } else {
                    this.pause();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(section);
    }

    activate(index) {
        // Stop the in-flight progress tween
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }

        // Toggle is-active on tabs and content panels
        for (let i = 0; i < this.count; i++) {
            this.tabs[i].classList.toggle('is-active', i === index);
            this.contents[i].classList.toggle('is-active', i === index);
        }
        this.activeIndex = index;

        // Reset every progress line to 0%
        this.lines.forEach((line) => {
            if (line) gsap.set(line, { width: '0%' });
        });

        if (this.duration <= 0 || window.innerWidth <= 1024) {
            const activeLine = this.lines[index];
            if (activeLine) gsap.set(activeLine, { width: '100%' });
            return;
        }

        // The progress tween IS the timer: when its width reaches 100%,
        // onComplete advances to the next tab. If a tab has no line,
        // fall back to a delayedCall so the cycle still advances.
        const activeLine = this.lines[index];
        const seconds = this.duration / 1000;

        this.tween = activeLine
            ? gsap.to(activeLine, {
                width: '100%',
                duration: seconds,
                ease: 'none',
                onComplete: () => this.next(),
            })
            : gsap.delayedCall(seconds, () => this.next());

        if (this.paused) this.tween.pause();
    }

    next() {
        this.activate((this.activeIndex + 1) % this.count);
    }

    pause() {
        this.paused = true;
        if (this.tween) this.tween.pause();
    }

    resume() {
        this.paused = false;
        if (this.tween) this.tween.resume();
    }

    bindEvents(hoverTargets) {
        // Click → jump to that tab and restart the progress from 0%
        this.tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => this.activate(i));
        });

        // Pause auto-rotate (and the progress line) while hovering
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => this.pause());
            target.addEventListener('mouseleave', () => this.resume());
        });
    }
}

