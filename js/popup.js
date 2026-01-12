// js/popup.js
// Handles popup modals with sessionStorage to prevent spamming the user.

document.addEventListener('DOMContentLoaded', function () {
  const popupBtn = document.getElementById('popup-btn'); // "Info" button
  const popupModal = document.getElementById('popup-modal'); // Page-specific modal
  const closePopup = document.getElementById('close-popup');

  const welcomeModal = document.getElementById('welcome-modal'); // Generic welcome modal
  const closeWelcome = document.getElementById('close-welcome');
  const ginkgoLogo = document.querySelector('.ginkgo-logo');

  // --- Helper: Get a unique key for the current page ---
  // Uses pathname (e.g., "/contact.html") to track visits per page
  const pageKey = 'seenPopup_' + window.location.pathname;

  // --- 1. Auto-Open Logic (On Page Load) ---
  const hasSeen = sessionStorage.getItem(pageKey);

  // If we haven't seen the popup for this page yet, show the PAGE SPECIFIC popup
  // (User requested: "only show once when you were on the page")
  // We prioritize popup-modal over welcome-modal for specific pages if both exist,
  // or maybe we only want to show the relevant one.
  // Based on current HTML, 'popup-modal' contains the specific page context (e.g. SOS text).

  if (!hasSeen) {
    if (popupModal) {
      popupModal.style.display = 'flex';
    } else if (welcomeModal) {
      // Fallback if no specific popup exists but welcome does (e.g. maybe index?)
      welcomeModal.style.display = 'flex';
    }
    // Mark as seen immediately so a refresh won't show it again
    sessionStorage.setItem(pageKey, 'true');
  }

  // --- 2. Event Listeners for Manual Open/Close ---

  // INFO BUTTON -> Opens Page Specific Popup
  if (popupBtn && popupModal) {
    popupBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      popupModal.style.display = 'flex';
    });
  }

  // LOGO -> Opens Welcome Modal (or Redirects? User said logo opens welcome in previous tasks, keeping this behavior)
  if (ginkgoLogo && welcomeModal) {
    ginkgoLogo.style.cursor = 'pointer';
    ginkgoLogo.addEventListener('click', function (e) {
      // If we are on index, maybe just open modal?
      // Or if logo usually goes home, we might want to prevent default if it's a link.
      // Assuming logo is just an img based on HTML.
      e.stopPropagation();
      welcomeModal.style.display = 'flex';
    });
  }

  // CLOSE BUTTONS
  if (closePopup && popupModal) {
    closePopup.addEventListener('click', function () {
      popupModal.style.display = 'none';
      // Stop prop to prevent the background click listener from firing immediately if nested
    });
  }

  if (closeWelcome && welcomeModal) {
    closeWelcome.addEventListener('click', function () {
      welcomeModal.style.display = 'none';
    });
  }

  // BACKGROUND CLICK CLOSING
  // Close popup-modal when clicking outside the content (or essentially anywhere on the backdrop)
  if (popupModal) {
    popupModal.addEventListener('click', function (e) {
      // If clicking the backdrop (the flex container itself)
      if (e.target === popupModal) {
        popupModal.style.display = 'none';
      }
    });
  }

  if (welcomeModal) {
    welcomeModal.addEventListener('click', function (e) {
      if (e.target === welcomeModal) {
        welcomeModal.style.display = 'none';
      }
    });
  }
});
