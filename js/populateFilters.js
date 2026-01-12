// js/populateFilters.js
// Fetch and populate artist, area, and date filters from Directus

const DIRECTUS_API_URL = 'https://your-directus-instance.com'; // <-- Replace with your Directus URL

async function fetchAndPopulateFilters() {
  // Fetch artists
  const artistRes = await fetch(`${DIRECTUS_API_URL}/items/artists`);
  const artistData = await artistRes.json();
  const artistFilter = document.getElementById('artist-filter');
  if (artistData.data) {
    artistData.data.forEach(artist => {
      const opt = document.createElement('option');
      opt.value = artist.id;
      opt.textContent = artist.name;
      artistFilter.appendChild(opt);
    });
  }

  // Fetch areas
  const areaRes = await fetch(`${DIRECTUS_API_URL}/items/areas`);
  const areaData = await areaRes.json();
  const areaFilter = document.getElementById('area-filter');
  if (areaData.data) {
    areaData.data.forEach(area => {
      const opt = document.createElement('option');
      opt.value = area.id;
      opt.textContent = area.name;
      areaFilter.appendChild(opt);
    });
  }

  // Fetch projects for years
  const projectRes = await fetch(`${DIRECTUS_API_URL}/items/projects?fields=date`);
  const projectData = await projectRes.json();
  const dateFilter = document.getElementById('date-filter');
  if (projectData.data) {
    // Get unique years
    const years = [...new Set(projectData.data.map(p => p.date && p.date.substring(0,4)).filter(Boolean))].sort((a,b)=>b-a);
    years.forEach(year => {
      const opt = document.createElement('option');
      opt.value = year;
      opt.textContent = year;
      dateFilter.appendChild(opt);
    });
  }
}

document.addEventListener('DOMContentLoaded', fetchAndPopulateFilters);
