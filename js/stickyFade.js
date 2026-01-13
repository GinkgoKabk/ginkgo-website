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
    const idleTime = 1500; // 1.5 seconds
    let lastScrollY = window.scrollY;

    // State to track search/input focus
    let isFocused = false;

    function showStickyElements() {
        stickyElements.forEach(el => {
            el.style.opacity = '1';
        });
    }

    function fadeStickyElements() {
        if (window.scrollY > 10 && !isFocused) {
            stickyElements.forEach(el => {
                el.style.opacity = '0.25';
            });
        }
    }

    function wakeUp() {
        showStickyElements();
        clearTimeout(fadeTimeout);
        // Reschedule fade only if not focused
        if (window.scrollY > 10 && !isFocused) {
            fadeTimeout = setTimeout(fadeStickyElements, idleTime);
        }
    }

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Always show at very top
        if (currentScrollY <= 10) {
            showStickyElements();
            clearTimeout(fadeTimeout);
            fadeTimeout = null;
        } else {
            // Check Focus
            if (isFocused) {
                showStickyElements();
                clearTimeout(fadeTimeout);
            }
            else {
                if (currentScrollY < lastScrollY) {
                    showStickyElements();
                    clearTimeout(fadeTimeout);
                    fadeTimeout = setTimeout(fadeStickyElements, idleTime);
                } else {
                    const isVisible = stickyElements[0].style.opacity === '1';
                    if (isVisible && !fadeTimeout) {
                        fadeTimeout = setTimeout(fadeStickyElements, idleTime);
                    }
                }
            }
        }
        lastScrollY = currentScrollY;
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
