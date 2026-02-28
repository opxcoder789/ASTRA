// =====================================================
// SUPABASE API FUNCTIONS
// =====================================================

class SupabaseAPI {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // =====================================================
    // PRODUCTS
    // =====================================================
    
    async getAllProducts() {
        const { data, error } = await this.supabase
            .from('products')
            .select(`
                *,
                product_colors (*),
                product_images (*)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async getProductById(id) {
        const { data, error } = await this.supabase
            .from('products')
            .select(`
                *,
                product_colors (*),
                product_images (*)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    async createProduct(productData) {
        const { data, error } = await this.supabase
            .from('products')
            .insert([productData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateProduct(id, productData) {
        const { data, error } = await this.supabase
            .from('products')
            .update({ ...productData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteProduct(id) {
        const { error } = await this.supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    // =====================================================
    // PRODUCT COLORS
    // =====================================================
    
    async addProductColor(productId, colorData) {
        const { data, error } = await this.supabase
            .from('product_colors')
            .insert([{ product_id: productId, ...colorData }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteProductColor(colorId) {
        const { error } = await this.supabase
            .from('product_colors')
            .delete()
            .eq('id', colorId);
        
        if (error) throw error;
        return true;
    }

    // =====================================================
    // PRODUCT IMAGES
    // =====================================================
    
    async uploadProductImage(file, productId, colorId = null) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from('product-images')
            .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = this.supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
        
        const { data, error } = await this.supabase
            .from('product_images')
            .insert([{
                product_id: productId,
                color_id: colorId,
                image_url: urlData.publicUrl
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteProductImage(imageId, imageUrl) {
        // Extract file path from URL
        const urlParts = imageUrl.split('/product-images/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await this.supabase.storage
                .from('product-images')
                .remove([filePath]);
        }
        
        const { error } = await this.supabase
            .from('product_images')
            .delete()
            .eq('id', imageId);
        
        if (error) throw error;
        return true;
    }

    async setImageOrder(imageId, order) {
        const { data, error } = await this.supabase
            .from('product_images')
            .update({ image_order: order })
            .eq('id', imageId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // =====================================================
    // HERO VIDEOS
    // =====================================================
    
    async getAllHeroVideos() {
        const { data, error } = await this.supabase
            .from('hero_videos')
            .select('*')
            .order('video_order', { ascending: true });
        
        if (error) throw error;
        return data;
    }

    async uploadHeroVideo(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `hero_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from('hero-videos')
            .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = this.supabase.storage
            .from('hero-videos')
            .getPublicUrl(fileName);
        
        const { data, error } = await this.supabase
            .from('hero_videos')
            .insert([{ video_url: urlData.publicUrl }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteHeroVideo(videoId, videoUrl) {
        const urlParts = videoUrl.split('/hero-videos/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await this.supabase.storage
                .from('hero-videos')
                .remove([filePath]);
        }
        
        const { error } = await this.supabase
            .from('hero_videos')
            .delete()
            .eq('id', videoId);
        
        if (error) throw error;
        return true;
    }

    async updateVideoOrder(videoId, order) {
        const { data, error } = await this.supabase
            .from('hero_videos')
            .update({ video_order: order })
            .eq('id', videoId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // =====================================================
    // LANDING CARDS
    // =====================================================
    
    async getAllLandingCards() {
        const { data, error } = await this.supabase
            .from('landing_cards')
            .select('*')
            .order('card_order', { ascending: true });
        
        if (error) throw error;
        return data;
    }

    async uploadLandingCard(file, title, linkUrl) {
        const fileExt = file.name.split('.').pop();
        const fileName = `card_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from('landing-cards')
            .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = this.supabase.storage
            .from('landing-cards')
            .getPublicUrl(fileName);
        
        const { data, error } = await this.supabase
            .from('landing_cards')
            .insert([{
                title: title,
                image_url: urlData.publicUrl,
                link_url: linkUrl
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateLandingCard(cardId, updates) {
        const { data, error } = await this.supabase
            .from('landing_cards')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', cardId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteLandingCard(cardId, imageUrl) {
        const urlParts = imageUrl.split('/landing-cards/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await this.supabase.storage
                .from('landing-cards')
                .remove([filePath]);
        }
        
        const { error } = await this.supabase
            .from('landing_cards')
            .delete()
            .eq('id', cardId);
        
        if (error) throw error;
        return true;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseAPI;
}
