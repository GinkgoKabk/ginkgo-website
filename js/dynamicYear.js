/**
 * dynamicYear.js
 * Automatically updates the copyright year.
 */

document.addEventListener("DOMContentLoaded", () => {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
