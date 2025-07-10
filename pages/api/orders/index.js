import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false, // disable built-in for handling multipart manually
    },
};

const filePath = path.join(process.cwd(), 'data', 'order.json');

export default async function handler(req, res) {
    try {
        const fileData = await fsPromises.readFile(filePath, 'utf8');
        let items = JSON.parse(fileData);

        // ✅ GET Request
        if (req.method === 'GET') {
            return res.status(200).json({ data: items });
        }

        // ✅ Multipart/form-data image upload
        if (
            req.method === 'POST' &&
            req.headers['content-type']?.includes('multipart/form-data')
        ) {
            const uploadDir = path.join(process.cwd(), 'public', 'cake-img');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const form = formidable({ uploadDir, keepExtensions: true });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Form parse error:', err);
                    return res.status(500).json({ error: 'Image upload failed' });
                }

                const file = files.image?.[0];
                if (!file) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }

                const fileName = path.basename(file.filepath);
                const filePath = `/cake-img/${fileName}`;
                return res.status(200).json({ filePath });
            });

            return;
        }

        // ✅ JSON POST Request
        if (
            req.method === 'POST' &&
            req.headers['content-type']?.includes('application/json')
        ) {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const body = Buffer.concat(buffers).toString();
            const newItem = JSON.parse(body);
            newItem.id = Date.now().toString();

            console.log('newItem', newItem);

            items.push(newItem);

            await fsPromises.writeFile(filePath, JSON.stringify(items, null, 2));

            return res.status(201).json({ message: 'Item added', item: newItem });
        }

        // ✅ PUT request
        if (
            req.method === 'PUT' &&
            req.headers['content-type']?.includes('application/json')
        ) {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const body = Buffer.concat(buffers).toString();
            const updatedItem = JSON.parse(body);

            items = items.map(item =>
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            );

            await fsPromises.writeFile(filePath, JSON.stringify(items, null, 2));

            return res.status(200).json({ message: 'Item updated', item: updatedItem });
        }

        // ✅ DELETE request
        if (
            req.method === 'DELETE' &&
            req.headers['content-type']?.includes('application/json')
        ) {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const body = Buffer.concat(buffers).toString();
            const { id } = JSON.parse(body);

            items = items.filter(item => item.id !== id);
            await fsPromises.writeFile(filePath, JSON.stringify(items, null, 2));

            return res.status(200).json({ message: 'Item deleted', id });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
}
