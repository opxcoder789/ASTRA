// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

const SUPABASE_CONFIG = {
    // Replace with your Supabase project URL
    url: 'YOUR_SUPABASE_URL',
    
    // Replace with your Supabase anon/public key
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    
    // Storage buckets
    buckets: {
        productImages: 'product-images',
        heroVideos: 'hero-videos',
        landingCards: 'landing-cards'
    }
};

// Admin credentials
const ADMIN_CONFIG = {
    password: '1223' // Simple password as requested
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, ADMIN_CONFIG };
}
