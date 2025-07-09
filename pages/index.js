'use client';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Home() {
    const [productss, setProductss] = useState([]);
    useEffect(() => {
        
    }, []);
    return (
        <div>
            <ToastContainer position="top-right" autoClose={2000} />
            <h1>Comming Soon</h1>
            {/* <ul>{productss.map(products => <li key={products.id}>{products.title}</li>)}</ul> */}
        </div>
    );
}