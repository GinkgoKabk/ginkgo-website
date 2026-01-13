/**
 * fetchNews.js
 * Fetches news data from Strapi and renders it to the DOM.
 */

async function fetchNews() {
    const newsContainer = document.querySelector('.news-list');
    if (!newsContainer) return;

    // Show a loading state
    newsContainer.innerHTML = '<p style="text-align:center; width:100%;">Loading news...</p>';

    try {
        // Fetch news items from Strapi
        // Collection type: 'news-item' -> API endpoint: 'api/news-items'
        const response = await fetch(`${CONFIG.API_URL}/api/news-items?populate=*&sort=createdAt:desc`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const newsItems = data.data;

        newsContainer.innerHTML = ''; // Clear loading message

        if (newsItems.length === 0) {
            newsContainer.innerHTML = '<p style="text-align:center;">No news updates yet.</p>';
            return;
        }

        newsItems.forEach(item => {
            // Strapi v5 returns flat objects, v4 returns nested 'attributes'
            const attributes = item.attributes || item;

            // Extract data
            const title = attributes.title || attributes.Title || 'Untitled News';
            const rawDate = attributes.publishedDate || attributes.PublishedDate;
            const content = attributes.content || attributes.Content || '';

            // Format Date (e.g., "May 2025")
            let formattedDate = '';
            if (rawDate) {
                const dateObj = new Date(rawDate);
                formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }

            // Handle Image
            // v5 flat: attributes.image
            // v4 nested: attributes.image.data
            let imageData = null;
            if (attributes.image) {
                imageData = attributes.image.data || attributes.image;
            } else if (attributes.Image) {
                imageData = attributes.Image.data || attributes.Image;
            }

            // Safety check: if user chose "Multiple Media" by mistake, imageData might be an array
            if (Array.isArray(imageData)) {
                imageData = imageData[0];
            }

            let imgUrl = '';
            if (imageData) {
                // v5 flat: imageData.url
                // v4 nested: imageData.attributes.url
                const imgInner = imageData.attributes || imageData;
                if (imgInner && imgInner.url) {
                    imgUrl = CONFIG.getMediaUrl(imgInner.url);
                }
            }

            // Create Card Container
            const card = document.createElement('div');
            card.classList.add('news-card'); // New class for list style

            // Construct HTML
            // Summary Row: Title + Date
            // Details: Image + Content

            let imageHtml = '';
            if (imgUrl) {
                // Determine if we want gallery behavior or just a single image
                // consistently with projects, let's wrap in project-images class if we want consistent styling
                imageHtml = `
                    <div class="project-images">
                        <img src="${imgUrl}" alt="${title} Photo">
                    </div>`;
            }

            // Render Content
            let renderedContent = '';
            if (Array.isArray(content)) {
                renderedContent = renderStrapiBlocks(content);
            } else if (typeof content === 'string') {
                if (typeof marked !== 'undefined') {
                    renderedContent = marked.parse(content);
                } else {
                    renderedContent = content;
                }
            }

            card.innerHTML = `
                <div class="news-summary">
                    <h3>${title}</h3>
                    <p class="date">${formattedDate}</p>
                    
                    ${imgUrl ? `
                    <div class="news-image-preview">
                        <img src="${imgUrl}" alt="${title}">
                    </div>` : ''}

                    <div class="news-preview">
                        ${renderedContent}
                    </div>
                </div>
                <div class="news-details">
                    <div class="description-content">${renderedContent}</div>
                    <!-- Image already shown in summary, do we hide it here or keep it? 
                         User said "if you open the news articel the entire text shows". 
                         Usually best to keep image visible. 
                         If image is in summary, it stays visible. 
                         So we don't need it duplicated in details. -->
                </div>
            `;

            // Add Click Event to Toggle Expansion
            card.addEventListener('click', function () {
                // Close other open news cards
                document.querySelectorAll('.news-card.expanded').forEach(c => {
                    if (c !== card) c.classList.remove('expanded');
                });

                const willExpand = !card.classList.contains('expanded');
                card.classList.toggle('expanded');

                // Smooth Scroll to card if expanding
                if (willExpand) {
                    const headerOffset = 100; // Account for sticky header
                    const cardTop = card.getBoundingClientRect().top + window.pageYOffset;
                    setTimeout(() => {
                        window.scrollTo({ top: cardTop - headerOffset, behavior: 'smooth' });
                    }, 10);
                }
            });

            newsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to fetch news:', error);
        newsContainer.innerHTML = `
            <div style="text-align:center; width:100%; color: red;">
                <p><strong>Error Loading News:</strong> ${error.message}</p>
                <p>Please check the console.</p>
            </div>`;
    }
}

/**
 * Basic renderer for Strapi Blocks (Rich Text v2)
 */
function renderStrapiBlocks(blocks) {
    if (!Array.isArray(blocks)) return '';

    return blocks.map(block => {
        const text = block.children ? block.children.map(child => {
            let t = child.text || '';
            if (child.bold) t = `<strong>${t}</strong>`;
            if (child.italic) t = `<em>${t}</em>`;
            if (child.underline) t = `<u>${t}</u>`;
            if (child.strikethrough) t = `<s>${t}</s>`;
            if (child.code) t = `<code>${t}</code>`;
            // Add link support if needed
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

// Initialize on load
document.addEventListener('DOMContentLoaded', fetchNews);
