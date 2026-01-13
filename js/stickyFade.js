/**
 * stickyFade.js
 * Handles the fading of sticky header and filters after inactivity,
 * unless the user is at the top of the page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const filters = document.querySelector('.filters');

    // Elements to manage
    const stickyElements = [header, filters].filter(el => el); // Filter out nulls if .filters missing (e.g. contact page)

    if (stickyElements.length === 0) return;

    let fadeTimeout;
    const idleTime = 2000; // 2 seconds

    // Function to show elements (Opacity 1)
    function showStickyElements() {
        stickyElements.forEach(el => {
            el.style.opacity = '1';
        });
    }

    // Function to fade elements (Opacity 0.25)
    function fadeStickyElements() {
        // Only fade if NOT at the very top (allow small buffer)
        if (window.scrollY > 10) {
            stickyElements.forEach(el => {
                el.style.opacity = '0.25';
            });
        }
    }

    // Reset timer on interaction
    function resetFadeTimer() {
        showStickyElements();
        clearTimeout(fadeTimeout);

        // Check if we are at the top, if so, we don't need to schedule a fade
        if (window.scrollY <= 10) {
            return;
        }

        fadeTimeout = setTimeout(fadeStickyElements, idleTime);
    }

    // Event Listeners
    window.addEventListener('scroll', resetFadeTimer, { passive: true });
    window.addEventListener('mousemove', resetFadeTimer, { passive: true });
    window.addEventListener('touchstart', resetFadeTimer, { passive: true });
    window.addEventListener('click', resetFadeTimer, { passive: true });

    // Specific Hover Listeners for the elements themselves to keep them awake
    stickyElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            showStickyElements();
            clearTimeout(fadeTimeout); // Stop fading while hovering
        });

        // When leaving, restart the timer
        el.addEventListener('mouseleave', resetFadeTimer);
    });

    // Initial check
    resetFadeTimer();
});
