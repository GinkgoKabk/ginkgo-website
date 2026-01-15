// filter.js
function filterProjects() {
  const tagSearch = document.getElementById('tag-search').value.toLowerCase();
  const artistFilter = document.getElementById('artist-filter').value.toLowerCase();
  const areaFilter = document.getElementById('area-filter').value.toLowerCase();
  const dateFilter = document.getElementById('date-filter').value.toLowerCase();

  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const tags = card.dataset.tags.toLowerCase();
    const artist = card.dataset.artist.toLowerCase();
    const area = card.dataset.area.toLowerCase();
    const date = card.dataset.date.toLowerCase();
    // Get the project title (h3) text
    const titleElem = card.querySelector('.project-summary h3');
    const title = titleElem ? titleElem.textContent.toLowerCase() : '';

    // Search bar now also checks the project title and individual tag words (handles +, spaces, commas, and trims)
    // Also: fallback to check the .tags textContent if present (for legacy or display-only tags)
    let tagWords = tags.replace(/\+/g, ' ').split(/[\s,]+/).map(word => word.trim()).filter(Boolean);
    // Add .tags textContent words if available
    const tagsElem = card.querySelector('.tags');
    if (tagsElem) {
      const displayTags = tagsElem.textContent.toLowerCase().replace(/\+/g, ' ').split(/[\s,]+/).map(word => word.trim()).filter(Boolean);
      tagWords = tagWords.concat(displayTags);
    }
    const matchesTagSearch = tagSearch === '' ||
      tagWords.some(word => word === tagSearch) ||
      tagWords.some(word => word.includes(tagSearch)) ||
      artist.includes(tagSearch) ||
      area.includes(tagSearch) ||
      date.includes(tagSearch) ||
      title.includes(tagSearch);
    const matchesArtistFilter = artistFilter === '' || artist === artistFilter;
    const matchesAreaFilter = areaFilter === '' || area === areaFilter;
    const matchesDateFilter = dateFilter === '' || date === dateFilter;

    if (matchesTagSearch && matchesArtistFilter && matchesAreaFilter && matchesDateFilter) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Function to toggle the expansion of project details
// Only one project card can be expanded at a time
function initializeProjectInteractions() {
  document.querySelectorAll('.project-card').forEach(card => {
    // Remove existing listeners to prevent duplicates if re-initialized
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    card = newCard; // Update reference

    card.addEventListener('click', () => {
      // Close all other expanded cards
      document.querySelectorAll('.project-card.expanded').forEach(expandedCard => {
        if (expandedCard !== card) {
          expandedCard.classList.remove('expanded');
        }
      });
      // Toggle the clicked card
      const willExpand = !card.classList.contains('expanded');
      card.classList.toggle('expanded');
      // If expanding, smoothly scroll to show the top of the card near the top of the viewport with a margin
      if (willExpand) {
        const headerOffset = 24; // px, adjust as needed for your design
        const cardTop = card.getBoundingClientRect().top + window.pageYOffset;
        const scrollTo = cardTop - headerOffset;
        // Use requestAnimationFrame to ensure the class is applied before scrolling
        setTimeout(() => {
          window.scrollTo({ top: scrollTo, behavior: 'smooth' });
        }, 10);
      }
    });

    // Re-initialize image interactions for this card
    // Enabled on all devices now (including mobile)
    initializeImageInteractions(card);
  });
}

// --- Gallery Helper Functions ---

function closeGallery() {
  const expandedImg = document.querySelector('.project-images img.expanded');
  if (expandedImg) {
    expandedImg.classList.remove('expanded');
  }
  removeImageArrows();
  removeOverlay();
  document.removeEventListener('keydown', handleArrowNav);
}

function openGallery(img) {
  // Check for currently expanded image (switching vs opening)
  const currentExpanded = document.querySelector('.project-images img.expanded');
  if (currentExpanded) {
    currentExpanded.classList.remove('expanded');
  } else {
    // Start fresh
    createOverlay();
    document.addEventListener('keydown', handleArrowNav);
  }

  img.classList.add('expanded');
  showImageArrows(img);
}

function createOverlay() {
  if (document.querySelector('.gallery-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  document.body.appendChild(overlay);
  // Force reflow
  overlay.offsetHeight;
  overlay.classList.add('visible');

  // Click on overlay closes gallery
  overlay.onclick = () => {
    closeGallery();
  };
}

function removeOverlay() {
  const overlay = document.querySelector('.gallery-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.remove();
      }
    }, 300);
  }
}

function showImageArrows(currentImg) {
  removeImageArrows();
  // Find siblings in the same group
  const imageGroup = currentImg.closest('.project-images');
  if (!imageGroup) return;

  const imagesArr = Array.from(imageGroup.querySelectorAll('img'));
  const idx = imagesArr.indexOf(currentImg);

  // Left arrow
  if (idx > 0) {
    const leftArrow = document.createElement('div');
    leftArrow.className = 'img-arrow img-arrow-left';
    leftArrow.innerHTML = '&#8592;';
    leftArrow.onclick = (e) => {
      e.stopPropagation();
      openGallery(imagesArr[idx - 1]);
    };
    document.body.appendChild(leftArrow);
  }
  // Right arrow
  if (idx < imagesArr.length - 1) {
    const rightArrow = document.createElement('div');
    rightArrow.className = 'img-arrow img-arrow-right';
    rightArrow.innerHTML = '&#8594;';
    rightArrow.onclick = (e) => {
      e.stopPropagation();
      openGallery(imagesArr[idx + 1]);
    };
    document.body.appendChild(rightArrow);
  }
}

function removeImageArrows() {
  document.querySelectorAll('.img-arrow').forEach(arrow => arrow.remove());
}

function handleArrowNav(e) {
  const expandedImg = document.querySelector('.project-images img.expanded');
  if (!expandedImg) return;

  const imageGroup = expandedImg.closest('.project-images');
  const images = Array.from(imageGroup.querySelectorAll('img'));
  const idx = images.indexOf(expandedImg);

  if (e.key === 'ArrowLeft' && idx > 0) {
    openGallery(images[idx - 1]);
    e.preventDefault();
  } else if (e.key === 'ArrowRight' && idx < images.length - 1) {
    openGallery(images[idx + 1]);
    e.preventDefault();
  } else if (e.key === 'Escape') {
    closeGallery();
    e.preventDefault();
  }
}

// Global click listener to close if clicking outside (fallback)
document.addEventListener('click', (e) => {
  const expandedImg = document.querySelector('.project-images img.expanded');
  // If there is an expanded image
  if (expandedImg) {
    // If the click is NOT on the image, NOT on an arrow, and NOT on the overlay (overlay has its own handler)
    if (!e.target.classList.contains('expanded') &&
      !e.target.classList.contains('img-arrow') &&
      !e.target.classList.contains('gallery-overlay')) {
      closeGallery();
    }
  }
});


function initializeImageInteractions(card) {
  const imageGroup = card.querySelector('.project-images');
  if (!imageGroup) return;

  const images = Array.from(imageGroup.querySelectorAll('img'));
  images.forEach((img) => {
    // Clone to remove old listeners if re-initializing
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);

    newImg.addEventListener('click', (e) => {
      e.stopPropagation();
      if (newImg.classList.contains('expanded')) {
        closeGallery();
      } else {
        openGallery(newImg);
      }
    });
  });
}