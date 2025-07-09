'use client';

import styles from './shopproduct.module.scss';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function Admin() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        id: '',
        productImage: '',
        productTitle: '',
        price: '',
        originalPrice: '',
        note: '',
        description: '',
        rating: '',
        reviewCount: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        const res = await fetch('/api/products');
        const result = await res.json();
        // console.log("data", data)
        setProducts(result?.data);
    };

    const handleChange = (e) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = '/api/products';
        const payload = editingId ? { ...form, id: editingId } : form;
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            getProducts();
            setForm({
                id: '', productImage: '', productTitle: '', price: '',
                originalPrice: '', note: '', description: '', rating: '', reviewCount: ''
            });
            setEditingId(null);
        } else {
            setError("Failed to save product");
        }
    };

    const handleEdit = (product) => {
        setForm(product);
        setEditingId(product.id);
    };

    const handleDelete = async (id) => {
        const res = await fetch('/api/products', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            getProducts();
        }
    };
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/products', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            setForm((prev) => ({ ...prev, productImage: data.filePath }));
        } else {
            alert('Image upload failed');
        }
    };
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Products</h1>
            <p className={styles.error}>{error}</p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                    Product Title:
                    <input
                        name="productTitle"
                        placeholder="Title"
                        value={form.productTitle}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Product Image:
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    {form.productImage && <img src={form.productImage} alt="Preview" width="80" />}
                </label>

                <label>
                    Price:
                    <input
                        name="price"
                        placeholder="Price"
                        value={form.price}
                        onChange={handleChange}
                        pattern="^\d+(\.\d{1,2})?$"
                        title="Please enter a valid number"
                        required
                    />
                </label>

                <label>
                    Original Price:
                    <input
                        name="originalPrice"
                        placeholder="Original Price"
                        value={form.originalPrice}
                        onChange={handleChange}
                        pattern="^\d+(\.\d{1,2})?$"
                        title="Please enter a valid number"
                        required
                    />
                </label>

                <label>
                    Note:
                    <input
                        name="note"
                        placeholder="Note"
                        value={form.note}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Description:
                    <input
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Rating:
                    <input
                        name="rating"
                        placeholder="Rating"
                        value={form.rating}
                        onChange={handleChange}
                        pattern="^\d+(\.\d{1,2})?$"
                        title="Please enter a valid rating (e.g., 4.5)"
                        required
                    />
                </label>

                <label>
                    Review Count:
                    <input
                        name="reviewCount"
                        placeholder="Review Count"
                        value={form.reviewCount}
                        onChange={handleChange}
                        pattern="^\d+$"
                        title="Only integer numbers allowed"
                        required
                    />
                </label>

                <button type="submit" className={styles.addproduct}>
                    {editingId ? 'Update' : 'Add'} Product
                </button>
            </form>


            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Note</th>
                        <th>Description</th>
                        <th>Rating</th>
                        <th>Reviews</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td><img src={product.productImage} alt={product.productTitle} width="60" /></td>
                            <td>{product.productTitle}</td>
                            <td>₹{product.price} <del>₹{product.originalPrice}</del></td>
                            <td>{product.note}</td>
                            <td>{product.description}</td>
                            <td>{product.rating}</td>
                            <td>{product.reviewCount}</td>
                            <td>
                                <button onClick={() => handleEdit(product)}><FaEdit /></button>
                                <button onClick={() => handleDelete(product.id)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}