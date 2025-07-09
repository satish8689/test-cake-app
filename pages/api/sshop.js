import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            console.log("Fetching shops...");
            const { data, error } = await supabase.from('shops').select('*');

            if (error) throw error;

            return res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching shops:", error);
            return res.status(500).json({ error: "Failed to fetch shops" });
        }
    } else {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}
