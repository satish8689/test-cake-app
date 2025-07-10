'use client';

import { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import styles from './indexadmin.module.scss';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPopup, setShowPopup] = useState(true);

    const SECRET_KEY = 'mySecretKey'; // Use a better secret key in production
    const VALID_PASSWORD = '567890';

    useEffect(() => {
        const encryptedCode = localStorage.getItem('admin_code');
        if (encryptedCode) {
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedCode, SECRET_KEY);
            const decryptedCode = decryptedBytes.toString(CryptoJS.enc.Utf8);
            
            if (decryptedCode === VALID_PASSWORD) {
                setIsAuthenticated(true);
                setShowPopup(false);
            }
        }
    }, []);

    const handleSubmit = () => {
        if (password === VALID_PASSWORD) {
            const encryptedCode = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
            localStorage.setItem('admin_code', encryptedCode);

            setIsAuthenticated(true);
            setShowPopup(false);

            // Auto remove after 60 minutes
            setTimeout(() => {
                localStorage.removeItem('admin_code');
                setIsAuthenticated(false);
                setShowPopup(true);
            }, 60 * 60 * 1000);
        } else {
            alert('Invalid Code! Try Again.');
        }
    };

    if (!isAuthenticated && showPopup) {
        return (
            <div className={styles.popupOverlay}>
                <div className={styles.popupContent}>
                    <h2>Enter Admin Code</h2>
                    <input 
                        type="password" 
                        className={styles.input} 
                        placeholder="Enter Code" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <button className={styles.submitButton} onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to Admin Panel</h1>
            {/* Admin functionalities go here */}
        </div>
        <div className={styles.container}>
        <button className={styles.hrefButton} onClick={() => window.location.href = '/admin/myorders'}>My Order</button>
        <button className={styles.hrefButton} onClick={() => window.location.href = '/admin/shopproduct'}>Shop Product</button>
            {/* <button className={styles.hrefButton} onClick={() => window.location.href = '/admin/icproduct'}>Common Product</button> */}
        {/* Admin functionalities go here */}
    </div></>
    );
}
