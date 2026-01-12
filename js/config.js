// configuration for the application
const CONFIG = {
    // Default to localhost for development. Update this when deploying to production.
    API_URL: 'https://ginkgo-strapi.onrender.com',
    // Helper to get the full image URL. Strapi images often return a relative path.
    getMediaUrl: (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('//')) return url;
        return `${CONFIG.API_URL}${url}`;
    }
};
