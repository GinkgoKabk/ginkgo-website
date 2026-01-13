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

    // State to track search/input focus
    let isFocused = false;

    // Function to show elements (Opacity 1)
    function showStickyElements() {
        stickyElements.forEach(el => {
            el.style.opacity = '1';
        });
    }

    // Function to fade elements (Opacity 0.25)
    function fadeStickyElements() {
        // Only fade if NOT at the very top AND NOT focused
        if (window.scrollY > 10 && !isFocused) {
            stickyElements.forEach(el => {
                el.style.opacity = '0.25';
            });
        }
    }

    // Function strictly for waking up or maintaining wakefulness
    function wakeUp() {
        showStickyElements();
        clearTimeout(fadeTimeout);
        // Reschedule fade only if not focused
        if (window.scrollY > 10 && !isFocused) {
            fadeTimeout = setTimeout(fadeStickyElements, idleTime);
        }
    }

    window.addEventListener('scroll', () => {
        // Check top position
        if (window.scrollY <= 10) {
            showStickyElements(); // Always show at top
            clearTimeout(fadeTimeout);
        } else {
            // Check if we need to start fading (if we were previously at top)
            if (!isFocused) {
                clearTimeout(fadeTimeout); // Clear existing to debounce? Or just let it run?
                // If we scroll down, we should eventually fade. 
                // If we are already running a timeout, let it be. 
                // If not, maybe we should start one? 
                // Actually existing logic just checked scrollY in fadeStickyElements.
                // Let's ensure we start the timer if we scrolled away from top.
                if (!fadeTimeout) {
                    fadeTimeout = setTimeout(fadeStickyElements, idleTime);
                }
            } else {
                showStickyElements(); // Keep visible if focused/scrolling
            }
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
            if (window.scrollY > 10 && !isFocused) {
                fadeTimeout = setTimeout(fadeStickyElements, idleTime);
            }
        });
    });

    // Detect Focus on Inputs (Search/Filters)
    const inputs = document.querySelectorAll('.filters input, .filters select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            isFocused = true;
            wakeUp(); // Wake up immediately and stay awake
        });

        input.addEventListener('blur', () => {
            isFocused = false;
            // Resume fading logic
            if (window.scrollY > 10) {
                fadeTimeout = setTimeout(fadeStickyElements, idleTime);
            }
        });
    });

    // Initial check on load
    if (window.scrollY <= 10) {
        showStickyElements();
    } else {
        fadeTimeout = setTimeout(fadeStickyElements, idleTime);
    }
});
