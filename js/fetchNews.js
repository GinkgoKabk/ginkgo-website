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
        const response = await fetch(`${CONFIG.API_URL}/api/news-items?populate=*&sort=publishedDate:desc`);

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

            // Create Article Element
            const article = document.createElement('article');
            article.classList.add('news-article');

            // Add click event for expanding image (replicating original behavior)
            // Note: The original generic toggleNewsImage function might not strictly be needed if we add the listener here directly
            article.addEventListener('click', () => {
                article.classList.toggle('show-image');
            });

            // Construct HTML
            let imageHtml = '';
            if (imgUrl) {
                imageHtml = `<img class="news-image" src="${imgUrl}" alt="${title} Photo">`;
            }

            // Render Content
            // Check if content is Strapi Blocks (Array) or Markdown (String)
            let renderedContent = '';
            if (Array.isArray(content)) {
                renderedContent = renderStrapiBlocks(content);
            } else if (typeof content === 'string') {
                // If it's a string, assuming Markdown
                // specific check if marked is available to avoid crash
                if (typeof marked !== 'undefined') {
                    renderedContent = marked.parse(content);
                } else {
                    renderedContent = content;
                }
            }

            article.innerHTML = `
                ${imageHtml}
                <div class="news-content">
                    <h3>${title}</h3>
                    ${formattedDate ? `<p><strong>Published:</strong> ${formattedDate}</p>` : ''}
                    <div class="news-text">${renderedContent}</div> 
                </div>
            `;
            // Note: using marked.parse assuming we might want markdown support, 
            // but for now let's stick to simple text if they use Rich Text field which often returns markdown.
            // If they use standard text, we might just put it in a p tag.
            // Let's adjust to be safe: if content is simple text, just display it. 
            // Strapi Rich Text is usually Markdown. We need a markdown parser. 
            // As I don't want to add a heavy dependency right now without asking, 
            // I'll assume standard text or basic HTML rendering for now, or just text.

            newsContainer.appendChild(article);
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
