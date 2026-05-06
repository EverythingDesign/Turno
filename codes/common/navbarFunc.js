/*** navbar open and close + on scroll transform ***/
console.log("fcghjvgb");

(function () {
    if (window.innerWidth > 1025) return;
    const servicesDdBtn = document.querySelector("#services-dd-btn");
    const servicesDd = document.querySelector(".nav_outer_link_wrap");

    // Toggle dropdown when button is clicked
    servicesDdBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevents the document click listener below from firing immediately
        servicesDd.classList.toggle("is-active"); // Note: removed the '.' before is-active
    });

    // Close dropdown when clicking anywhere outside
    document.addEventListener("click", (e) => {
        if (!servicesDdBtn.contains(e.target) && !servicesDd.contains(e.target)) {
            servicesDd.classList.remove("is-active");
        }
    });

    // Close dropdown on scroll
    window.addEventListener("scroll", () => {
        if (servicesDd.classList.contains("is-active")) {
            servicesDd.classList.remove("is-active");
        }
    }, { passive: true });

})();


(function () {
    const hamBtn = document.querySelector("#ham-menu");
    const closeHamBtns = document.querySelectorAll("[close-ham]");
    const menu = document.querySelector(".side-nav");
    hamBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevents the document click listener below from firing immediately
        menu.classList.toggle("is-active");
        
        // Stop/start lenis scroll depending on menu state
        if (typeof lenis !== "undefined") {
            if (menu.classList.contains("is-active")) {
                lenis.stop();
            } else {
                lenis.start();
            }
        }
    });
    // Close dropdown when clicking on close buttons
    closeHamBtns.forEach(closeHamBtn => {
        closeHamBtn.addEventListener("click", (e) => {
            menu.classList.remove("is-active");
            if (typeof lenis !== "undefined") lenis.start();
        })
    })
})();

// --- Navbar Hide/Show on Scroll ---
(function () {
    const nav = document.querySelector(".nav_component");
    if (!nav) return;

    // Make sure it transitions smoothly
    nav.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        // 1. Safari iOS Rubber-banding at the very top (pulling down past 0)
        // Always force the navbar to show when at the top
        if (currentScrollY <= 0) {
            nav.style.transform = "translateY(0%)";
            lastScrollY = currentScrollY;
            return;
        }

        // 2. Safari iOS Rubber-banding at the very bottom (pulling up past max)
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (currentScrollY >= maxScroll) {
            lastScrollY = currentScrollY;
            return;
        }

        // 3. Scrolling DOWN: Hide
        if (currentScrollY > lastScrollY + 5) { // +5 adds a tiny threshold to prevent ultra-sensitive hiding
            nav.style.transform = "translateY(-100%)";
            lastScrollY = currentScrollY;
        } 
        // 4. Scrolling UP: Show
        else if (currentScrollY < lastScrollY - 5) {
            nav.style.transform = "translateY(0%)";
            lastScrollY = currentScrollY;
        }
    });
})();