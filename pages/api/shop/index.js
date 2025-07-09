import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            console.log("Fetching shops...");
            const { data, error } = await supabase.from('shops').select('*');
            if (error) throw error;
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const requestData = req.body;
            
            // Check if a shop with the same name already exists
            const { data: existingShop, error: fetchError } = await supabase
                .from('shops')
                .select('*')
                .eq('name', requestData.name)
                .maybeSingle();
        
            if (fetchError) {
                return res.status(500).json({ error: 'Error checking existing shop' });
            }
        
            if (existingShop) {
                return res.status(400).json({ error: 'Shop with this name already exists' });
            }
        
            // Insert the new shop if it doesn't exist
            const { data: newShop, error } = await supabase
                .from('shops')
                .insert([requestData])
                .select()
                .maybeSingle();
        
            if (error) {
                return res.status(500).json({ error: 'Error inserting shop' });
            }
        
            return res.status(200).json(newShop);
        }

        if (req.method === 'PUT') {
            const { id, ...data } = await req.body;
            const { data: updatedShop, error } = await supabase.from('shops').update(data).eq('id', id).select().single();
            if (error) throw error;
            return res.status(200).json(updatedShop);
        }

        if (req.method === 'DELETE') {
            const { id } = req.body; // Get ID from query parameters
        
            if (!id) {
                return res.status(400).json({ error: 'Shop ID is required' });
            }
        
            const { error } = await supabase.from('shops').delete().eq('id', id);
        
            if (error) {
                return res.status(500).json({ error: 'Error deleting shop' });
            }
        
            return res.status(200).json({ message: 'Shop deleted successfully' });
        }

        return res.status(405).json({ error: "Method Not Allowed" });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
