/**
 * fetchProjects.js
 * Fetches project data from Strapi and renders it to the DOM.
 */

async function fetchProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    // Show a loading state (optional)
    projectsGrid.innerHTML = '<p style="text-align:center; width:100%;">Loading projects...</p>';

    try {
        // Fetch projects from Strapi
        // We assume the content type is 'projects' and we want to populate 'Banners' (images)
        const response = await fetch(`${CONFIG.API_URL}/api/projects?populate=*`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const projects = data.data; // Strapi v4 response structure: { data: [ ... ], meta: { ... } }

        projectsGrid.innerHTML = ''; // Clear loading message

        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p>No projects found.</p>';
            return;
        }

        projects.forEach(projectItem => {
            // Strapi v5 returns flat objects, v4 returns nested 'attributes'
            const attributes = projectItem.attributes || projectItem;

            // Extract data (Strapi V4/V5 returns attributes in camelCase/lowercase)
            const title = attributes.title || attributes.Title || 'Untitled Project';
            const year = attributes.year || attributes.Year || '';
            const artist = attributes.artist || attributes.Artist || 'Unknown Artist';
            /* Debugging ArtistURL: Check all possible cases */
            console.log('Project Attributes:', attributes);
            const artistUrl = attributes.artistUrl || attributes.ArtistUrl || attributes.ArtistURL || attributes.artistURL || '#';
            const area = attributes.area || attributes.Area || 'General';
            const tags = attributes.tags || attributes.Tags || ''; // Expecting format like "+solar +water"
            const summary = attributes.summary || attributes.Summary || '';
            const fullDescription = attributes.description || attributes.Description || '';

            // Handle media (check both cases)
            // v5 flat: attributes.banners
            // v4 nested: attributes.banners.data
            let images = [];
            if (attributes.banners) {
                if (Array.isArray(attributes.banners)) {
                    images = attributes.banners; // v5 flat array
                } else if (attributes.banners.data) {
                    images = attributes.banners.data; // v4 nested
                }
            } else if (attributes.Banners) {
                // Fallback for Capitalized case if API differs
                if (Array.isArray(attributes.Banners)) {
                    images = attributes.Banners;
                } else if (attributes.Banners.data) {
                    images = attributes.Banners.data;
                }
            }

            // Create Card
            const card = document.createElement('div');
            card.classList.add('project-card');

            // Add data attributes for filtering
            // remove '+' and create comma separated list for compatibility if needed, 
            // but the current filter.js likely reads these raw attributes.
            // Let's inspect how the filter.js works (it likely parses text content or data attributes).
            // The HTML had explicit data attributes: data-tags, data-artist, data-area, data-date.

            // Clean tags for data attribute if they are stored as space separated "+tag"
            const rawTags = tags.replace(/\+/g, '').replace(/\s+/g, ', ').trim();

            card.setAttribute('data-tags', rawTags);
            card.setAttribute('data-artist', artist);
            card.setAttribute('data-area', area);
            card.setAttribute('data-date', year);

            // Construct Images HTML
            let imagesHtml = '';
            images.forEach(img => {
                // v5 flat: img.url
                // v4 nested: img.attributes.url
                const imgData = img.attributes || img;
                const imgUrl = CONFIG.getMediaUrl(imgData.url);
                imagesHtml += `<img src="${imgUrl}" alt="${title} image">`;
            });

            // Fallback image if none
            if (images.length === 0) {
                imagesHtml = '<img src="images/placeholder.png" alt="No image available">';
            }


            // Render Description (Handle both String and Blocks)
            let renderedDescription = '';
            if (Array.isArray(fullDescription)) {
                // Ensure function is defined below or imported
                renderedDescription = renderStrapiBlocksForProjects(fullDescription);
            } else if (typeof fullDescription === 'string') {
                // Basic markdown support if needed, or just text
                const convertedText = fullDescription.replace(/\n/g, '<br>');
                renderedDescription = `<p>${convertedText}</p>`;
            }

            card.innerHTML = `
                <div class="project-summary">
                    <h3>${title}</h3>
                    <p class="date">${year}</p>
                    <p class="artist">
                        ${artist}
                        ${artistUrl && artistUrl !== '#' ? `<a href="${artistUrl}" target="_blank" rel="noopener noreferrer" class="artist-url-hidden">${artistUrl}</a>` : ''}
                    </p>
                    <p class="area">${area}</p>
                    <p class="tags">
                        ${tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
                    </p>
                </div>
                <div class="project-details">
                    <div class="description-content">${renderedDescription}</div>
                    <div class="project-images">
                        ${imagesHtml}
                    </div>
                </div>
            `;

            projectsGrid.appendChild(card);
        });

        // Populate Filters based on the fetched data
        populateFilters(projects);

        // Re-initialize filters if necessary
        if (typeof filterProjects === 'function') {
            filterProjects();
        }

        // Initialize Interactions (Click to expand, image gallery)
        // Defined in filter.js, now exposed as a function
        if (typeof initializeProjectInteractions === 'function') {
            initializeProjectInteractions();
        }

    } catch (error) {
        console.error('Failed to fetch projects:', error);
        projectsGrid.innerHTML = `
                < div style = "text-align:center; width:100%; color: red;" >
                <p><strong>Error Loading Projects:</strong> ${error.message}</p>
                <p>Please check the console for more details.</p>
            </div > `;
    }
}

/**
 * Extracts unique values from projects and populates the select dropdowns
 */
function populateFilters(projects) {
    const artists = new Set();
    const areas = new Set();
    const years = new Set();

    projects.forEach(p => {
        // Handle v5 flat vs v4 nested
        const attr = p.attributes || p;

        const artist = attr.artist || attr.Artist;
        const area = attr.area || attr.Area;
        const year = attr.year || attr.Year;

        if (artist) artists.add(artist);
        if (area) areas.add(area);
        if (year) years.add(year);
    });

    const artistSelect = document.getElementById('artist-filter');
    const areaSelect = document.getElementById('area-filter');
    const dateSelect = document.getElementById('date-filter');

    if (artistSelect) populateSelect(artistSelect, artists);
    if (areaSelect) populateSelect(areaSelect, areas);
    if (dateSelect) populateSelect(dateSelect, years);
}

function populateSelect(selectElement, set) {
    // Keep the first option (e.g. "Artist", "Area", "Year")
    const validOptions = Array.from(set).filter(Boolean).sort();

    // Clear existing options except the first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    validOptions.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        selectElement.appendChild(option);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', fetchProjects);

/**
 * Basic renderer for Strapi Blocks (Rich Text v2)
 * Duplicated from fetchNews.js to avoid dependency issues if not shared.
 */
function renderStrapiBlocksForProjects(blocks) {
    if (!Array.isArray(blocks)) return '';

    return blocks.map(block => {
        const text = block.children ? block.children.map(child => {
            let t = child.text || '';
            if (child.bold) t = `<strong>${t}</strong>`;
            if (child.italic) t = `<em>${t}</em>`;
            if (child.underline) t = `<u>${t}</u>`;
            if (child.strikethrough) t = `<s>${t}</s>`;
            if (child.code) t = `<code>${t}</code>`;
            // Handle links if child.type === 'link' (basic support)
            if (child.type === 'link') {
                t = `<a href="${child.url}">${child.children[0].text}</a>`;
            }
            return t;
        }).join('') : '';

        switch (block.type) {
            case 'paragraph': return `<p>${text}</p>`;
            case 'heading': return `<h${block.level}>${text}</h${block.level}>`;
            case 'list':
                const tag = block.format === 'ordered' ? 'ol' : 'ul';
                const items = block.children.map(item => `<li>${item.children.map(c => c.text).join('')}</li>`).join('');
                return `<${tag}>${items}</${tag}>`;
            case 'quote': return `<blockquote>${text}</blockquote>`;
            case 'image': return ''; // Handle inline images if simple
            default: return `<p>${text}</p>`;
        }
    }).join('');
}
