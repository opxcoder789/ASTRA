// =====================================================
// SUPABASE INITIALIZATION - FIXED
// =====================================================

console.log('🔧 Initializing Supabase...');

// Wait for dependencies to load
(function initializeSupabase() {
    // Check if dependencies are loaded
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library not loaded!');
        console.log('⏳ Waiting for Supabase library...');
        setTimeout(initializeSupabase, 100);
        return;
    }

    if (typeof SUPABASE_CONFIG === 'undefined') {
        console.error('❌ SUPABASE_CONFIG not loaded!');
        console.log('⏳ Waiting for config...');
        setTimeout(initializeSupabase, 100);
        return;
    }

    if (typeof SupabaseAPI === 'undefined') {
        console.error('❌ SupabaseAPI class not loaded!');
        console.log('⏳ Waiting for API class...');
        setTimeout(initializeSupabase, 100);
        return;
    }

    try {
        // Initialize Supabase client
        console.log('📡 Creating Supabase client...');
        window.supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );

        // Initialize API with Supabase client
        console.log('🔨 Creating API instance...');
        window.API = new SupabaseAPI(window.supabaseClient);

        console.log('✅ Supabase initialized successfully!');
        console.log('📦 API object:', window.API);
        console.log('🔗 Supabase URL:', SUPABASE_CONFIG.url);

        // Test connection
        testConnection();

    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
})();

// Test connection
async function testConnection() {
    try {
        console.log('🧪 Testing database connection...');
        
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Database connection failed:', error.message);
            console.log('💡 Make sure you have run the SQL schema in Supabase dashboard');
            return false;
        }
        
        console.log('✅ Database connected successfully!');
        console.log('📊 Connection test result:', data);
        return true;
    } catch (err) {
        console.error('❌ Connection error:', err);
        console.log('💡 Check your Supabase credentials in config.js');
        return false;
    }
}

// Make testConnection available globally
window.testConnection = testConnection;

console.log('🚀 Init script loaded');
