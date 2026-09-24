import { supabase } from '../lib/supabaseClient';
import { VendorPortfolio, PortfolioImage } from '../types';
import { getCurrentAuthUserId } from './tenant';

const YOUTUBE_URLS_CACHE_KEY = 'weddfin-portfolio-youtube-urls';

function getLocalYoutubeUrlsMap(): Record<string, string> {
    try {
        const stored = localStorage.getItem(YOUTUBE_URLS_CACHE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveLocalYoutubeUrl(id: string, url: string) {
    if (!id) return;
    try {
        const map = getLocalYoutubeUrlsMap();
        map[id] = url;
        localStorage.setItem(YOUTUBE_URLS_CACHE_KEY, JSON.stringify(map));
    } catch {}
}

function removeLocalYoutubeUrl(id: string) {
    if (!id) return;
    try {
        const map = getLocalYoutubeUrlsMap();
        delete map[id];
        localStorage.setItem(YOUTUBE_URLS_CACHE_KEY, JSON.stringify(map));
    } catch {}
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const createVendorPortfolio = async (portfolioData: Omit<VendorPortfolio, 'id' | 'created_at' | 'updated_at'>): Promise<VendorPortfolio> => {
    const payload = { ...portfolioData, user_id: await getCurrentAuthUserId() };

    let { data, error } = await supabase
        .from('vendor_portfolios')
        .insert([payload])
        .select()
        .single();

    // If youtube_url column does not exist yet in Supabase schema (PGRST204),
    // retry inserting without youtube_url and cache youtube_url locally.
    if (error && error.code === 'PGRST204' && (error.message.includes('youtube_url') || error.message.includes('column'))) {
        console.warn('[vendorPortfolios] youtube_url column missing in Supabase, inserting without it and saving locally.');
        const { youtube_url, ...withoutYoutube } = payload;
        const retry = await supabase
            .from('vendor_portfolios')
            .insert([withoutYoutube])
            .select()
            .single();

        if (retry.error) {
            console.error('Error creating portfolio on retry:', retry.error);
            throw new Error('Gagal membuat portofolio');
        }

        data = retry.data;
        if (data && youtube_url) {
            data.youtube_url = youtube_url;
            saveLocalYoutubeUrl(data.id, youtube_url);
        }
        return data;
    }

    if (error) {
        console.error('Error creating portfolio:', error);
        if (error.code === '42P01' || (error as any).status === 404) {
            throw new Error('Tabel vendor_portfolios belum dibuat di Supabase.');
        }
        throw new Error('Gagal membuat portofolio: ' + (error.message || ''));
    }

    return data;
};

export const listVendorPortfolios = async (): Promise<VendorPortfolio[]> => {
    const { data, error } = await supabase
        .from('vendor_portfolios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        if (error.code === '42P01' || (error as any).status === 404) {
            console.warn('[vendorPortfolios] Table does not exist yet.');
            return [];
        }
        console.error('Error fetching portfolios:', error);
        return [];
    }

    const youtubeMap = getLocalYoutubeUrlsMap();
    return (data || []).map(p => ({
        ...p,
        youtube_url: p.youtube_url || youtubeMap[p.id] || undefined
    }));
};

export const getVendorPortfolio = async (id: string): Promise<VendorPortfolio | null> => {
    const { data, error } = await supabase
        .from('vendor_portfolios')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching portfolio:', error);
        return null;
    }

    const youtubeMap = getLocalYoutubeUrlsMap();
    return {
        ...data,
        youtube_url: data.youtube_url || youtubeMap[id] || undefined
    };
};

export const updateVendorPortfolio = async (id: string, updates: Partial<VendorPortfolio>): Promise<VendorPortfolio> => {
    let { data, error } = await supabase
        .from('vendor_portfolios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    // If youtube_url column is missing in schema, retry without it
    if (error && error.code === 'PGRST204' && (error.message.includes('youtube_url') || error.message.includes('column'))) {
        const { youtube_url, ...withoutYoutube } = updates;
        const retry = await supabase
            .from('vendor_portfolios')
            .update(withoutYoutube)
            .eq('id', id)
            .select()
            .single();

        if (retry.error) {
            console.error('Error updating portfolio on retry:', retry.error);
            throw new Error('Gagal mengupdate portofolio');
        }

        data = retry.data;
        if (youtube_url !== undefined && data) {
            data.youtube_url = youtube_url;
            saveLocalYoutubeUrl(id, youtube_url);
        }
        return data;
    }

    if (error) {
        console.error('Error updating portfolio:', error);
        throw new Error('Gagal mengupdate portofolio');
    }

    return data;
};

export const deleteVendorPortfolio = async (id: string): Promise<void> => {
    // Delete local cached youtube_url
    removeLocalYoutubeUrl(id);

    // Delete images from storage if available
    try {
        const portfolio = await getVendorPortfolio(id);
        if (portfolio) {
            const imagePaths: string[] = [];
            if (portfolio.cover_image_url && !portfolio.cover_image_url.startsWith('data:')) {
                try {
                    const coverUrl = new URL(portfolio.cover_image_url);
                    const path = coverUrl.pathname.split('/').pop();
                    if (path) imagePaths.push(path);
                } catch {}
            }
            
            if (portfolio.images && portfolio.images.length > 0) {
                portfolio.images.forEach(img => {
                    if (img.url && !img.url.startsWith('data:')) {
                        try {
                            const url = new URL(img.url);
                            const path = url.pathname.split('/').pop();
                            if (path) imagePaths.push(path);
                        } catch {}
                    }
                });
            }

            if (imagePaths.length > 0) {
                await supabase.storage
                    .from('gallery-images')
                    .remove(imagePaths);
            }
        }
    } catch (e) {
        // Storage deletion failure should not block portfolio deletion
    }

    const { error } = await supabase
        .from('vendor_portfolios')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting portfolio:', error);
        throw new Error('Gagal menghapus portofolio');
    }
};

export const uploadPortfolioImages = async (
    portfolioId: string,
    files: File[],
    onProgress?: (progress: number) => void
): Promise<PortfolioImage[]> => {
    const uploadedImages: PortfolioImage[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let imageUrl = '';

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${portfolioId}/img-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery-images')
                .upload(fileName, file);

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('gallery-images')
                    .getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            } else {
                console.warn('[vendorPortfolios] Storage upload failed, falling back to base64:', uploadError);
                imageUrl = await fileToBase64(file);
            }
        } catch (err) {
            console.warn('[vendorPortfolios] Storage upload exception, falling back to base64:', err);
            imageUrl = await fileToBase64(file);
        }

        if (imageUrl) {
            uploadedImages.push({
                id: crypto.randomUUID ? crypto.randomUUID() : `img-${Date.now()}-${i}`,
                url: imageUrl,
                uploadedAt: new Date().toISOString()
            });
        }

        if (onProgress) {
            onProgress(Math.round(((i + 1) / files.length) * 100));
        }
    }

    if (uploadedImages.length > 0) {
        const portfolio = await getVendorPortfolio(portfolioId);
        if (portfolio) {
            const updatedImages = [...(portfolio.images || []), ...uploadedImages];
            await updateVendorPortfolio(portfolioId, { images: updatedImages });
        }
    }

    return uploadedImages;
};

export const uploadPortfolioCover = async (
    portfolioId: string,
    file: File
): Promise<string> => {
    let coverUrl = '';

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${portfolioId}/cover-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('gallery-images')
            .upload(fileName, file);

        if (!uploadError) {
            const { data: urlData } = supabase.storage
                .from('gallery-images')
                .getPublicUrl(fileName);
            coverUrl = urlData.publicUrl;
        } else {
            console.warn('[vendorPortfolios] Cover upload failed, falling back to base64:', uploadError);
            coverUrl = await fileToBase64(file);
        }
    } catch (err) {
        console.warn('[vendorPortfolios] Cover upload exception, falling back to base64:', err);
        coverUrl = await fileToBase64(file);
    }

    await updateVendorPortfolio(portfolioId, { cover_image_url: coverUrl });
    return coverUrl;
};
