/**
 * stickyFade.js
 * Handles the fading of sticky header and filters.
 * Logic:
 *  - Fade out after 2 seconds of inactivity (on load or scroll stop).
 *  - Only WAKE UP if: 
 *      1. User hovers/clicks the Header/Filter directly.
 *      2. User moves mouse over Header/Filter directly.
 *      3. User is at the very top of the page (scrollY <= 10).
 *  - Global mouse movements or clicks elsewhere do NOT wake it up.
 */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const filters = document.querySelector('.filters');

    // Elements to manage
    const stickyElements = [header, filters].filter(el => el);

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
        // Only fade if NOT at the very top
        if (window.scrollY > 10) {
            stickyElements.forEach(el => {
                el.style.opacity = '0.25';
            });
        }
    }

    // Function strictly for waking up or maintaining wakefulness
    function wakeUp() {
        showStickyElements();
        clearTimeout(fadeTimeout);
        // Reschedule fade
        if (window.scrollY > 10) {
            fadeTimeout = setTimeout(fadeStickyElements, idleTime);
        }
    }

    // SCROLL wakes it up briefly? 
    // User said "until you hover... or your on the very top".
    // If I scroll, strictly speaking, I am not hovering. 
    // But if I scroll to top, it stays. 
    // Let's make scroll wake it up briefly so you see where you are, then fade?
    // User aid "not anywhere on the website" implying scrolling elsewhere shouldn't keep it awake.
    // I'll make scroll wake it, but interacting elsewhere (click/move) does NOT.

    window.addEventListener('scroll', () => {
        // Check top position
        if (window.scrollY <= 10) {
            showStickyElements(); // Always show at top
            clearTimeout(fadeTimeout);
        } else {
            // If scrolling elsewhere, we might want to wake it briefly?
            // "until you click or hover over it".
            // If I don't wake it on scroll, it feels broken.
            // I will NOT wake it on scroll (unless at top). 
            // Just let it live in faded state until interaction.
            fadeStickyElements();
        }
    }, { passive: true });


    // Interaction on the sticky elements themselves wakes them
    stickyElements.forEach(el => {
        el.addEventListener('mouseenter', wakeUp);
        el.addEventListener('click', wakeUp);
        // Mobile touch on the element
        el.addEventListener('touchstart', wakeUp, { passive: true });

        // When leaving, start timer
        el.addEventListener('mouseleave', () => {
            if (window.scrollY > 10) {
                fadeTimeout = setTimeout(fadeStickyElements, idleTime);
            }
        });
    });

    // Initial check on load
    if (window.scrollY <= 10) {
        showStickyElements();
    } else {
        // Start faded or fade soon?
        fadeTimeout = setTimeout(fadeStickyElements, idleTime);
    }
});
