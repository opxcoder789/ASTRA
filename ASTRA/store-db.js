// Store Page with Database Integration
// Initialize Supabase
const supabaseUrl = 'https://ewefbbswaaheqkqsfbzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZWZiYnN3YWFoZXFrcXNmYnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODA2NzIsImV4cCI6MjA4MDM1NjY3Mn0.QfdRKCO1gW9wvUWMcT4ocYVYs_rm-LS-nQV2u1Qyaqc';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let products = [];
let filteredProducts = [];
let currentSort = 'featured';
let showAvailable = 'all';
let priceRange = { min: 0, max: 10000 };
let searchQuery = '';

// Load products from database
async function loadProductsFromDB() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select(`
                *,
                product_images (
                    image_url,
                    image_order
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match existing format
        products = data.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.product_images && product.product_images.length > 0 
                ? product.product_images.sort((a, b) => a.image_order - b.image_order)[0].image_url
                : 'https://via.placeholder.com/400x500?text=No+Image',
            isSoldOut: product.is_sold_out,
            category: product.category,
            description: product.description
        }));
        
        filteredProducts = [...products];
        renderProducts();
        updateItemCount();
        
        console.log(`✅ Loaded ${products.length} products from database`);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        // Fallback to static products if database fails
        loadStaticProducts();
    }
}

// Fallback static products
function loadStaticProducts() {
    products = [
        { id: '1', title: '4X Power Denim Pants', price: 2999, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/73acfebc-7d37-4914-a7bb-31116e68dff3-owr-life/assets/images/A-2.jpg', isSoldOut: false },
        { id: '2', title: 'Action Speaks Denim', price: 2999, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/73acfebc-7d37-4914-a7bb-31116e68dff3-owr-life/assets/images/B-3.jpg', isSoldOut: false },
        { id: '3', title: 'Agni Denim Jacket', price: 2499, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/73acfebc-7d37-4914-a7bb-31116e68dff3-owr-life/assets/images/C-4.jpg', isSoldOut: true }
    ];
    filteredProducts = [...products];
    renderProducts();
    updateItemCount();
    console.log('⚠️ Using fallback static products');
}

function formatPrice(price) {
    return `Rs. ${price.toLocaleString('en-IN')}.00`;
}

function filterAndSortProducts() {
    let result = [...products];
    if (showAvailable === 'available') result = result.filter(p => !p.isSoldOut);
    else if (showAvailable === 'soldout') result = result.filter(p => p.isSoldOut);
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    if (searchQuery) result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch(currentSort) {
        case 'price-low': result.sort((a, b) => a.price - b.price); break;
        case 'price-high': result.sort((a, b) => b.price - a.price); break;
        case 'title-az': result.sort((a, b) => a.title.localeCompare(b.title)); break;
        case 'title-za': result.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    
    filteredProducts = result;
    renderProducts();
    updateItemCount();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">No products found</div>';
        return;
    }
    grid.innerHTML = filteredProducts.map(product => `
        <a href="#" class="product-card">
            <div class="product-image">
                ${product.isSoldOut ? '<div class="sold-out-badge">Sold out</div>' : ''}
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>${formatPrice(product.price)}</p>
            </div>
        </a>
    `).join('');
}

function updateItemCount() {
    const countEl = document.querySelector('.item-count');
    if (countEl) countEl.textContent = `${filteredProducts.length} items`;
}

function toggleOverlay(overlayId, show) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    if (show) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function createDropdown(items, onSelect) {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.innerHTML = items.map(item => `<div class="dropdown-item" data-value="${item.value}">${item.label}</div>`).join('');
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            onSelect(item.dataset.value);
            dropdown.remove();
        });
    });
    return dropdown;
}

document.addEventListener('DOMContentLoaded', function() {
    // Load products from database
    loadProductsFromDB();

    const searchBtn = document.getElementById('searchBtnStore');
    const closeSearch = document.getElementById('closeSearch');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = searchOverlay?.querySelector('input');

    if (searchBtn) searchBtn.addEventListener('click', () => toggleOverlay('searchOverlay', true));
    if (closeSearch) closeSearch.addEventListener('click', () => {
        toggleOverlay('searchOverlay', false);
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        filterAndSortProducts();
    });
    if (searchInput) searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterAndSortProducts();
    });

    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartBtn) cartBtn.addEventListener('click', () => toggleOverlay('cartOverlay', true));
    if (closeCart) closeCart.addEventListener('click', () => toggleOverlay('cartOverlay', false));
    if (cartOverlay) {
        const backdrop = cartOverlay.querySelector('.overlay-backdrop');
        const continueBtn = cartOverlay.querySelector('.continue-btn');
        if (backdrop) backdrop.addEventListener('click', () => toggleOverlay('cartOverlay', false));
        if (continueBtn) continueBtn.addEventListener('click', () => toggleOverlay('cartOverlay', false));
    }

    const profileBtn = document.getElementById('profileBtn');
    const closeProfile = document.getElementById('closeProfile');
    const profileOverlay = document.getElementById('profileOverlay');
    if (profileBtn) profileBtn.addEventListener('click', () => toggleOverlay('profileOverlay', true));
    if (closeProfile) closeProfile.addEventListener('click', () => toggleOverlay('profileOverlay', false));
    if (profileOverlay) {
        const backdrop = profileOverlay.querySelector('.overlay-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => toggleOverlay('profileOverlay', false));
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleOverlay('mobileMenu', true));
    if (closeMobileMenu) closeMobileMenu.addEventListener('click', () => toggleOverlay('mobileMenu', false));
    if (mobileMenu) {
        const backdrop = mobileMenu.querySelector('.mobile-menu-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => toggleOverlay('mobileMenu', false));
    }

    const availabilityFilter = document.querySelector('.filter-dropdown:first-child');
    if (availabilityFilter) {
        availabilityFilter.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());
            const dropdown = createDropdown([
                { value: 'all', label: 'All Products' },
                { value: 'available', label: 'In Stock' },
                { value: 'soldout', label: 'Sold Out' }
            ], (value) => {
                showAvailable = value;
                filterAndSortProducts();
            });
            this.appendChild(dropdown);
        });
    }

    const priceFilter = document.querySelector('.filter-left .filter-dropdown:nth-child(2)');
    if (priceFilter) {
        priceFilter.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());
            const dropdown = createDropdown([
                { value: 'all', label: 'All Prices' },
                { value: '0-1500', label: 'Under Rs. 1,500' },
                { value: '1500-2500', label: 'Rs. 1,500 - Rs. 2,500' },
                { value: '2500-3500', label: 'Rs. 2,500 - Rs. 3,500' },
                { value: '3500-10000', label: 'Above Rs. 3,500' }
            ], (value) => {
                if (value === 'all') {
                    priceRange = { min: 0, max: 10000 };
                } else {
                    const [min, max] = value.split('-').map(Number);
                    priceRange = { min, max };
                }
                filterAndSortProducts();
            });
            this.appendChild(dropdown);
        });
    }

    const sortFilter = document.querySelector('.filter-right .filter-dropdown');
    if (sortFilter) {
        sortFilter.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());
            const dropdown = createDropdown([
                { value: 'featured', label: 'Featured' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'title-az', label: 'Title: A-Z' },
                { value: 'title-za', label: 'Title: Z-A' }
            ], (value) => {
                currentSort = value;
                filterAndSortProducts();
            });
            this.appendChild(dropdown);
        });
    }

    const layoutBtns = document.querySelectorAll('.layout-btn');
    layoutBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            layoutBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const layout = this.getAttribute('data-layout');
            const grid = document.getElementById('productGrid');
            if (grid && layout === '4') {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                if (window.innerWidth >= 768) grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            } else if (grid) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                if (window.innerWidth >= 768) grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                if (window.innerWidth >= 1280) grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
            }
        });
    });

    const header = document.querySelector('.store-header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) header.style.background = 'rgba(0, 0, 0, 0.98)';
        else header.style.background = 'rgba(0, 0, 0, 0.95)';
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());
    });
});
