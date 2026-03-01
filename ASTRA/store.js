// Store Page JavaScript - Supabase Integrated
console.log('[v0] Store initializing with Supabase API...');

let products = [];
let filteredProducts = [];
let currentSort = 'featured';
let showAvailable = 'all';
let priceRange = { min: 0, max: 100000 };
let searchQuery = '';
let isLoading = true;

// ============================================================
// API Functions
// ============================================================

async function fetchProductsFromAPI() {
  try {
    console.log('[v0] Fetching products from API...');
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[v0] Received', data.length, 'products from API');
    
    // Transform database format to app format
    products = data.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      isSoldOut: p.is_sold_out,
      sizes: p.sizes || [],
      category: p.category,
      stock_quantity: p.stock_quantity
    }));
    
    isLoading = false;
    filterAndSortProducts();
    return true;
  } catch (error) {
    console.error('[v0] Error fetching products:', error);
    // Show error message to user
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,100,100,0.8);">
          <p>Error loading products from database</p>
          <p style="font-size: 0.9em; margin-top: 10px;">${error.message}</p>
          <p style="font-size: 0.8em; margin-top: 10px; opacity: 0.6;">Make sure the database is set up with products</p>
        </div>
      `;
    }
    isLoading = false;
    return false;
  }
}

async function fetchCategories() {
  try {
    console.log('[v0] Fetching categories...');
    const response = await fetch('/api/categories');
    if (!response.ok) return [];
    const categories = await response.json();
    console.log('[v0] Categories:', categories);
    return categories;
  } catch (error) {
    console.error('[v0] Error fetching categories:', error);
    return [];
  }
}

// ============================================================
// Utility Functions
// ============================================================

function formatPrice(price) {
    return `Rs. ${price.toLocaleString('en-IN')}.00`;
}

function filterAndSortProducts() {
    let result = [...products];
    
    // Availability filter
    if (showAvailable === 'available') {
        result = result.filter(p => !p.isSoldOut);
    } else if (showAvailable === 'soldout') {
        result = result.filter(p => p.isSoldOut);
    }
    
    // Price range filter
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    
    // Search filter
    if (searchQuery) {
        result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Sorting
    switch(currentSort) {
        case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'title-az':
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-za':
            result.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    
    filteredProducts = result;
    renderProducts();
    updateItemCount();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    if (isLoading) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">Loading products...</div>';
        return;
    }
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">No products found</div>';
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                ${product.isSoldOut ? '<div class="sold-out-badge">Sold out</div>' : ''}
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers to product cards
    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.dataset.id;
            const product = products.find(p => p.id == productId);
            if (product) {
                console.log('[v0] Selected product:', product);
                // You can add product detail view or add to cart here
            }
        });
    });
}

function updateItemCount() {
    const countEl = document.querySelector('.item-count');
    if (countEl) {
        countEl.textContent = `${filteredProducts.length} items`;
    }
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
    dropdown.innerHTML = items.map(item => 
        `<div class="dropdown-item" data-value="${item.value}">${item.label}</div>`
    ).join('');
    
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelect(item.dataset.value);
            dropdown.remove();
        });
    });
    
    return dropdown;
}

// ============================================================
// Event Listeners Setup
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[v0] DOM loaded, initializing store...');
    
    // Load products from API
    await fetchProductsFromAPI();
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtnStore');
    const closeSearch = document.getElementById('closeSearch');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = searchOverlay?.querySelector('input');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => toggleOverlay('searchOverlay', true));
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            toggleOverlay('searchOverlay', false);
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            filterAndSortProducts();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterAndSortProducts();
        });
    }

    // Cart functionality
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

    // Profile functionality
    const profileBtn = document.getElementById('profileBtn');
    const closeProfile = document.getElementById('closeProfile');
    const profileOverlay = document.getElementById('profileOverlay');
    
    if (profileBtn) profileBtn.addEventListener('click', () => toggleOverlay('profileOverlay', true));
    if (closeProfile) closeProfile.addEventListener('click', () => toggleOverlay('profileOverlay', false));
    
    if (profileOverlay) {
        const backdrop = profileOverlay.querySelector('.overlay-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => toggleOverlay('profileOverlay', false));
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleOverlay('mobileMenu', true));
    if (closeMobileMenu) closeMobileMenu.addEventListener('click', () => toggleOverlay('mobileMenu', false));
    
    if (mobileMenu) {
        const backdrop = mobileMenu.querySelector('.mobile-menu-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => toggleOverlay('mobileMenu', false));
    }

    // Availability filter
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

    // Price filter
    const priceFilter = document.querySelector('.filter-left .filter-dropdown:nth-child(2)');
    if (priceFilter) {
        priceFilter.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());
            const dropdown = createDropdown([
                { value: 'all', label: 'All Prices' },
                { value: '0-5000', label: 'Under Rs. 5,000' },
                { value: '5000-7500', label: 'Rs. 5,000 - Rs. 7,500' },
                { value: '7500-10000', label: 'Rs. 7,500 - Rs. 10,000' },
                { value: '10000-100000', label: 'Above Rs. 10,000' }
            ], (value) => {
                if (value === 'all') {
                    priceRange = { min: 0, max: 100000 };
                } else {
                    const [min, max] = value.split('-').map(Number);
                    priceRange = { min, max };
                }
                filterAndSortProducts();
            });
            this.appendChild(dropdown);
        });
    }

    // Sort filter
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

    // Layout buttons
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

    // Header scroll effect
    const header = document.querySelector('.store-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 0) {
                header.style.background = 'rgba(0, 0, 0, 0.98)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.95)';
            }
        });
    }

    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(d => d.remove());
    });
    
    console.log('[v0] Store initialization complete');
});
