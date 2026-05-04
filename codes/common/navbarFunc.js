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

})();


(function () {
    const hamBtn = document.querySelector("#ham-menu");
    const closeHamBtns = document.querySelectorAll("[close-ham]");
    const menu = document.querySelector(".side-nav");
    hamBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevents the document click listener below from firing immediately
        menu.classList.toggle("is-active"); // Note: removed the '.' before is-active
    });
    // Close dropdown when clicking anywhere outside
    closeHamBtns.forEach(closeHamBtn => {
        closeHamBtn.addEventListener("click", (e) => {
            menu.classList.remove("is-active");
        })
    })
})();