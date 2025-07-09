import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
    console.log("req.method", req.method)
    try {
        if (req.method === 'GET') {
            console.log("Fetching shops_products...");
            const { data, error } = await supabase.from('shops_products').select('*');
            if (error) throw error;
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const requestData = req.body;
            
            // Check if a shop product with the same shop_id and product_id already exists
            const { data: existingShopProduct, error: fetchError } = await supabase
                .from('shops_products')
                .select('*')
                .eq('shop_id', requestData.shop_id)
                .eq('product_id', requestData.product_id)
                .maybeSingle();
        
            if (fetchError) {
                return res.status(500).json({ error: 'Error checking existing shop product' });
            }
        
            if (existingShopProduct) {
                return res.status(400).json({ error: 'Shop product with this shop_id and product_id already exists' });
            }
        
            // Insert the new shop product if it doesn't exist
            const { data: newShopProduct, error } = await supabase
                .from('shops_products')
                .insert([{ 
                    shop_id: requestData.shop_id, 
                    product_id: requestData.product_id, 
                    price: requestData.price, 
                    type: requestData.type, 
                    note: requestData.note, 
                    description: requestData.description, 
                    position: requestData.position, 
                    availability: requestData.availability
                }])
                .select()
                .maybeSingle();
        
            if (error) {
                return res.status(500).json({ error: 'Error inserting shop product' });
            }
        
            return res.status(200).json(newShopProduct);
        }

        if (req.method === 'PUT') {
            const { id, ...data } = req.body;
            const { data: updatedShopProduct, error } = await supabase.from('shops_products').update(data).eq('id', id).select().single();
            if (error) throw error;
            return res.status(200).json(updatedShopProduct);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
        
            if (!id) {
                return res.status(400).json({ error: 'Shop product ID is required' });
            }
        
            const { error } = await supabase.from('shops_products').delete().eq('id', id);
        
            if (error) {
                return res.status(500).json({ error: 'Error deleting shop product' });
            }
        
            return res.status(200).json({ message: 'Shop product deleted successfully' });
        }

        return res.status(405).json({ error: "Method Not Allowed" });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
