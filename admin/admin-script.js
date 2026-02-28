// =====================================================
// ADMIN PANEL - ALL FUNCTIONS WORKING
// =====================================================

console.log('� Admin dashboard loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready, initializing all functions...');

    // =====================================================
    // NAVIGATION
    // =====================================================
    
    document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            console.log('📍 Navigating to:', section);
            
            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding section
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            const sectionEl = document.getElementById(`${section}Section`);
            if (sectionEl) sectionEl.classList.add('active');
            
            // Load data for section
            if (section === 'products') loadProducts();
            else if (section === 'landing') loadLandingCards();
            else if (section === 'hero') loadHeroVideos();
        });
    });

    // =====================================================
    // PRODUCTS MANAGEMENT
    // =====================================================
    
    window.loadProducts = async function() {
        const productsList = document.getElementById('productsList');
        if (!productsList) return;
        
        productsList.innerHTML = '<p style="padding: 40px; text-align: center; color: #999;">Loading products...</p>';
        
        // Check if API is available
        if (typeof API === 'undefined' || !window.API) {
            console.error('❌ API not initialized!');
            productsList.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #ef4444;">
                    <h3>⚠️ API Not Initialized</h3>
                    <p>The database connection is not ready yet.</p>
                    <p style="font-size: 14px; color: #999; margin-top: 10px;">Check browser console (F12) for details.</p>
                    <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">Reload Page</button>
                </div>
            `;
            return;
        }
        
        try {
            const products = await API.getAllProducts();
            console.log('✅ Loaded', products.length, 'products');
            
            if (products.length === 0) {
                productsList.innerHTML = `
                    <div style="padding: 60px; text-align: center; color: #999;">
                        <h3>No products yet</h3>
                        <p>Click "Add Product" to create your first product!</p>
                    </div>
                `;
                return;
            }
            
            productsList.innerHTML = products.map(product => {
                const mainImage = product.product_images && product.product_images.length > 0 
                    ? product.product_images[0].image_url 
                    : 'https://via.placeholder.com/300x400?text=No+Image';
                
                return `
                    <div class="product-card">
                        <img src="${mainImage}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x400?text=Image+Error'">
                        <h3>${product.title}</h3>
                        <p>Rs. ${product.price.toLocaleString()}</p>
                        ${product.is_sold_out ? '<span class="badge">Sold Out</span>' : ''}
                        <div class="card-actions">
                            <button onclick="editProduct('${product.id}')" class="btn-edit">Edit</button>
                            <button onclick="deleteProduct('${product.id}')" class="btn-delete">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('❌ Error loading products:', error);
            productsList.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #ef4444;">
                    <h3>Error Loading Products</h3>
                    <p>${error.message}</p>
                    <button onclick="loadProducts()" class="btn-primary" style="margin-top: 20px;">Retry</button>
                </div>
            `;
        }
    };

    // Add Product Button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('➕ Opening add product modal');
            document.getElementById('productModalTitle').textContent = 'Add Product';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('productModal').style.display = 'flex';
        });
    }

    // Product Form Submit
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('💾 Saving product...');
            
            // Check if API is available
            if (typeof API === 'undefined' || !window.API) {
                console.error('❌ API not initialized!');
                alert('❌ Error: Database connection not ready. Please reload the page.');
                return;
            }
            
            showLoading(true);
            
            const productData = {
                title: document.getElementById('productTitle').value.trim(),
                description: document.getElementById('productDescription').value.trim(),
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value.trim(),
                is_sold_out: document.getElementById('productSoldOut').checked
            };
            
            console.log('Product data:', productData);
            
            try {
                const productId = document.getElementById('productId').value;
                let savedProduct;
                
                if (productId) {
                    // Update existing product
                    console.log('Updating product:', productId);
                    savedProduct = await API.updateProduct(productId, productData);
                    console.log('✅ Product updated');
                } else {
                    // Create new product
                    console.log('Creating new product');
                    savedProduct = await API.createProduct(productData);
                    console.log('✅ Product created:', savedProduct.id);
                    
                    // Upload images if any
                    const imageFiles = document.getElementById('productImages').files;
                    if (imageFiles.length > 0) {
                        console.log('📸 Uploading', imageFiles.length, 'images...');
                        for (let i = 0; i < imageFiles.length; i++) {
                            await API.uploadProductImage(imageFiles[i], savedProduct.id);
                            console.log(`✅ Image ${i + 1}/${imageFiles.length} uploaded`);
                        }
                    }
                }
                
                closeModal('productModal');
                loadProducts();
                alert('✅ Product saved successfully!');
            } catch (error) {
                console.error('❌ Error saving product:', error);
                alert('❌ Error saving product: ' + error.message);
            } finally {
                showLoading(false);
            }
        });
    }

    // Image Preview
    const productImages = document.getElementById('productImages');
    if (productImages) {
        productImages.addEventListener('change', (e) => {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = '';
            
            const files = e.target.files;
            for (let i = 0; i < Math.min(files.length, 10); i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Edit Product
    window.editProduct = async function(id) {
        console.log('✏️ Editing product:', id);
        showLoading(true);
        try {
            const product = await API.getProductById(id);
            console.log('Product loaded:', product);
            
            document.getElementById('productModalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productTitle').value = product.title;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productSoldOut').checked = product.is_sold_out;
            
            document.getElementById('productModal').style.display = 'flex';
        } catch (error) {
            console.error('❌ Error loading product:', error);
            alert('❌ Error loading product: ' + error.message);
        } finally {
            showLoading(false);
        }
    };

    // Delete Product
    window.deleteProduct = async function(id) {
        if (!confirm('⚠️ Are you sure you want to delete this product?')) return;
        
        console.log('🗑️ Deleting product:', id);
        showLoading(true);
        try {
            await API.deleteProduct(id);
            console.log('✅ Product deleted');
            loadProducts();
            alert('✅ Product deleted successfully!');
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            alert('❌ Error deleting product: ' + error.message);
        } finally {
            showLoading(false);
        }
    };

    // =====================================================
    // LANDING CARDS MANAGEMENT
    // =====================================================
    
    window.loadLandingCards = async function() {
        const cardsList = document.getElementById('landingCardsList');
        if (!cardsList) return;
        
        cardsList.innerHTML = '<p style="padding: 40px; text-align: center; color: #999;">Loading cards...</p>';
        
        try {
            const cards = await API.getAllLandingCards();
            console.log('✅ Loaded', cards.length, 'cards');
            
            if (cards.length === 0) {
                cardsList.innerHTML = `
                    <div style="padding: 60px; text-align: center; color: #999;">
                        <h3>No cards yet</h3>
                        <p>Click "Add Card" to create your first landing card!</p>
                    </div>
                `;
                return;
            }
            
            cardsList.innerHTML = cards.map(card => `
                <div class="card-item">
                    <img src="${card.image_url}" alt="${card.title || 'Card'}">
                    <h3>${card.title || 'Untitled'}</h3>
                    ${card.link_url ? `<p style="font-size: 12px; color: #999; word-break: break-all;">${card.link_url}</p>` : ''}
                    <div class="card-actions">
                        <button onclick="deleteLandingCard('${card.id}', '${card.image_url}')" class="btn-delete">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Error loading cards:', error);
            cardsList.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #ef4444;">
                    <h3>Error Loading Cards</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    };

    // Add Card Button
    const addCardBtn = document.getElementById('addCardBtn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            console.log('➕ Opening add card modal');
            document.getElementById('cardForm').reset();
            document.getElementById('cardImagePreview').innerHTML = '';
            document.getElementById('cardModal').style.display = 'flex';
        });
    }

    // Card Form Submit
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('💾 Saving card...');
            showLoading(true);
            
            try {
                const title = document.getElementById('cardTitle').value.trim();
                const linkUrl = document.getElementById('cardLink').value.trim();
                const imageFile = document.getElementById('cardImage').files[0];
                
                if (!imageFile) {
                    alert('⚠️ Please select an image');
                    showLoading(false);
                    return;
                }
                
                console.log('Uploading card:', title);
                await API.uploadLandingCard(imageFile, title, linkUrl);
                console.log('✅ Card uploaded');
                
                closeModal('cardModal');
                loadLandingCards();
                alert('✅ Card added successfully!');
            } catch (error) {
                console.error('❌ Error adding card:', error);
                alert('❌ Error adding card: ' + error.message);
            } finally {
                showLoading(false);
            }
        });
    }

    // Card Image Preview
    const cardImage = document.getElementById('cardImage');
    if (cardImage) {
        cardImage.addEventListener('change', (e) => {
            const preview = document.getElementById('cardImagePreview');
            preview.innerHTML = '';
            
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: 8px; margin-top: 10px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Delete Landing Card
    window.deleteLandingCard = async function(id, imageUrl) {
        if (!confirm('⚠️ Are you sure you want to delete this card?')) return;
        
        console.log('🗑️ Deleting card:', id);
        showLoading(true);
        try {
            await API.deleteLandingCard(id, imageUrl);
            console.log('✅ Card deleted');
            loadLandingCards();
            alert('✅ Card deleted successfully!');
        } catch (error) {
            console.error('❌ Error deleting card:', error);
            alert('❌ Error deleting card: ' + error.message);
        } finally {
            showLoading(false);
        }
    };

    // =====================================================
    // HERO VIDEOS MANAGEMENT
    // =====================================================
    
    window.loadHeroVideos = async function() {
        const videosList = document.getElementById('heroVideosList');
        if (!videosList) return;
        
        videosList.innerHTML = '<p style="padding: 40px; text-align: center; color: #999;">Loading videos...</p>';
        
        try {
            const videos = await API.getAllHeroVideos();
            console.log('✅ Loaded', videos.length, 'videos');
            
            if (videos.length === 0) {
                videosList.innerHTML = `
                    <div style="padding: 60px; text-align: center; color: #999;">
                        <h3>No videos yet</h3>
                        <p>Click "Add Video" to upload your first hero video!</p>
                    </div>
                `;
                return;
            }
            
            videosList.innerHTML = videos.map(video => `
                <div class="video-item">
                    <video src="${video.video_url}" controls style="width: 100%; border-radius: 8px;"></video>
                    <div class="card-actions" style="margin-top: 10px;">
                        <button onclick="deleteHeroVideo('${video.id}', '${video.video_url}')" class="btn-delete">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Error loading videos:', error);
            videosList.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #ef4444;">
                    <h3>Error Loading Videos</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    };

    // Add Video Button
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            console.log('➕ Opening add video modal');
            document.getElementById('videoForm').reset();
            document.getElementById('videoModal').style.display = 'flex';
        });
    }

    // Video Form Submit
    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('💾 Uploading video...');
            showLoading(true);
            
            try {
                const videoFile = document.getElementById('heroVideo').files[0];
                
                if (!videoFile) {
                    alert('⚠️ Please select a video');
                    showLoading(false);
                    return;
                }
                
                if (videoFile.size > 50 * 1024 * 1024) {
                    alert('⚠️ Video file is too large. Max size is 50MB');
                    showLoading(false);
                    return;
                }
                
                console.log('Uploading video:', videoFile.name);
                await API.uploadHeroVideo(videoFile);
                console.log('✅ Video uploaded');
                
                closeModal('videoModal');
                loadHeroVideos();
                alert('✅ Video uploaded successfully!');
            } catch (error) {
                console.error('❌ Error uploading video:', error);
                alert('❌ Error uploading video: ' + error.message);
            } finally {
                showLoading(false);
            }
        });
    }

    // Delete Hero Video
    window.deleteHeroVideo = async function(id, videoUrl) {
        if (!confirm('⚠️ Are you sure you want to delete this video?')) return;
        
        console.log('🗑️ Deleting video:', id);
        showLoading(true);
        try {
            await API.deleteHeroVideo(id, videoUrl);
            console.log('✅ Video deleted');
            loadHeroVideos();
            alert('✅ Video deleted successfully!');
        } catch (error) {
            console.error('❌ Error deleting video:', error);
            alert('❌ Error deleting video: ' + error.message);
        } finally {
            showLoading(false);
        }
    };

    // =====================================================
    // MODAL CONTROLS
    // =====================================================
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                console.log('❌ Modal closed');
            }
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                console.log('❌ Modal closed (backdrop)');
            }
        });
    });

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log('❌ Modal closed:', modalId);
        }
    };

    // =====================================================
    // LOADING OVERLAY
    // =====================================================
    
    window.showLoading = function(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
            console.log(show ? '⏳ Loading...' : '✅ Loading complete');
        }
    };

    // =====================================================
    // INITIALIZATION
    // =====================================================
    
    console.log('✅ All admin functions initialized!');
    console.log('📦 Available functions:', Object.keys(window).filter(k => typeof window[k] === 'function' && ['loadProducts', 'loadLandingCards', 'loadHeroVideos', 'editProduct', 'deleteProduct'].includes(k)));
});
