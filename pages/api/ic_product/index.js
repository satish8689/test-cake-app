import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            console.log("Fetching ic_products...");
            const { data, error } = await supabase.from('ic_products').select('*');
            if (error) throw error;
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const requestData = req.body;
            
            // Check if a product with the same title already exists
            const { data: existingProduct, error: fetchError } = await supabase
                .from('ic_products')
                .select('*')
                .eq('title', requestData.title)
                .maybeSingle();
        
            if (fetchError) {
                return res.status(500).json({ error: 'Error checking existing product' });
            }
        
            if (existingProduct) {
                return res.status(400).json({ error: 'Product with this title already exists' });
            }
        
            // Insert the new product if it doesn't exist
            const { data: newProduct, error } = await supabase
                .from('ic_products')
                .insert([requestData])
                .select()
                .maybeSingle();
        
            if (error) {
                return res.status(500).json({ error: 'Error inserting product' });
            }
        
            return res.status(200).json(newProduct);
        }

        if (req.method === 'PUT') {
            const { id, ...data } = await req.body;
            const { data: updatedProduct, error } = await supabase.from('ic_products').update(data).eq('id', id).select().single();
            if (error) throw error;
            return res.status(200).json(updatedProduct);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body; // Get ID from query parameters
        
            if (!id) {
                return res.status(400).json({ error: 'Product ID is required' });
            }
        
            const { error } = await supabase.from('ic_products').delete().eq('id', id);
        
            if (error) {
                return res.status(500).json({ error: 'Error deleting product' });
            }
        
            return res.status(200).json({ message: 'Product deleted successfully' });
        }

        return res.status(405).json({ error: "Method Not Allowed" });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
