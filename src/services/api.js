import { supabase } from '../lib/supabaseClient';

const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL;


export const api = {
    // جلب المنتجات
    fetchProducts: async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        return data;
    },

    // إرسال المنتج إلى n8n
    addProduct: async (productData) => {
        try {
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('price', productData.price);
            formData.append('raw_description', productData.raw_description);

            if (productData.imageFile) {
                formData.append('image', productData.imageFile);
            }

            // إرسال للويب هوك
            const response = await fetch(N8N_WEBHOOK, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to connect to AI Agent');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('AI Processing Error:', error);
            throw error;
        }
    },

    // تحديث منتج يدوياً (بدون AI)
    updateProduct: async (id, updates) => {
        const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // دالة مساعدة لحذف منتج
    deleteProduct: async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};