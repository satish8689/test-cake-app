'use client';

import styles from './myorder.module.scss';
import { useEffect, useState } from 'react';
import { FaTrash } from "react-icons/fa";

export default function Admin() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        const res = await fetch('/api/orders');
        const result = await res.json();

        const sorted = result?.data?.sort((a, b) => new Date(a.deliveryDateTime) - new Date(b.deliveryDateTime));
        setProducts(sorted);
    };

    const handleDelete = async (id) => {
        const res = await fetch('/api/orders', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            getProducts();
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const res = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus }),
        });

        if (res.ok) {
            getProducts();
        } else {
            setError("Failed to update status");
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Orders</h1>
            <p className={styles.error}>{error}</p>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Delivery Date</th>
                        <th>Products</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.name}</td>
                            <td>{order.mobileNumber}</td>
                            <td>
                                <select
                                    value={order.status || "Pending"}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </td>
                            <td>{new Date(order.deliveryDateTime).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}</td>
                            <td>
                                {order.order.map((item) => (
                                    <div key={item.id} style={{ marginBottom: '5px' }}>
                                        <img src={item.productImage} alt={item.title} width="50" />
                                        <div>{item.title} - ₹{item.price} × {item.quantity}</div>
                                    </div>
                                ))}
                            </td>
                            <td>
                                <button onClick={() => handleDelete(order.id)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
