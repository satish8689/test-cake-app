'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaFilePdf, FaWhatsapp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './orderSummary.module.scss';

export default function OrderSummary({ selectedProducts = [], setSelectedProducts, goBack }) {
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (!Array.isArray(selectedProducts)) {
            setTotalAmount(0);
            return;
        }
        const total = selectedProducts.reduce((sum, product) => sum + (product.proTotalPrice || 0), 0);
        setTotalAmount(total);
    }, [selectedProducts]);

    const handleRemove = (id) => {
        const updatedProducts = selectedProducts.filter(product => product.id !== id);
        setSelectedProducts(updatedProducts);
    };

    const generateAndStorePDF = async () => {
        const doc = new jsPDF();
        const storedUser = JSON.parse(localStorage.getItem('userInfo')) || {};
        const userName = storedUser.name || 'Unknown User';
        const userContact = storedUser.mobile || 'Unknown Contact';
        const shopName = "Test Shop";
        const shopContact = "+91 1234567890";

        doc.setFontSize(16);
        doc.text("Order Summary", 80, 10);

        doc.setFontSize(12);
        doc.text(`Customer: ${userName}`, 14, 20);
        doc.text(`Contact: ${userContact}`, 14, 30);
        doc.text(`Shop: ${shopName}`, 120, 20);
        doc.text(`Shop Contact: ${shopContact}`, 120, 30);

        let totalAmount = 0;
        let totalProducts = selectedProducts.length;

        const tableData = selectedProducts.map((product, index) => {
            let quantityNumber = parseFloat(product.quantity) || 0;
            
            const totalPrice = quantityNumber * (product.price || 0);
            totalAmount += totalPrice;
            return [index + 1, product.title, product.quantity, `Rs ${product.price}`, `Rs ${totalPrice.toFixed(2)}`];
        });

        doc.autoTable({
            head: [['#', 'Product', 'Quantity', 'Unit Price', 'Total Price']],
            body: [
                ...tableData,
                [
                    {
                        content: ' ',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
                    },
                    {
                        content: ' ',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
                    },
                    {
                        content: ' ',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
                    },
                    {
                        content: 'Total Products',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
                    },
                    {
                        content: totalProducts,
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
                    }
                ],
                [
                    {
                        content: ' ',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
                    },
                    {
                        content: ' ',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
                    },
                    {
                        content: ' ',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff' }
                    },
                    {
                        content: 'Total Amount',
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
                    },
                    {
                        content: 'Rs ' + totalAmount.toFixed(2),
                        styles: { fontStyle: 'bold', halign: 'left', fillColor: '#fff', textColor: '#1d2a35' }
                    }
                ]
            ],
            startY: 40,
        });
        
        const fileName = `${new Date().toLocaleDateString().replace(/\//g, '-')}-Order-Summary.pdf`;
        doc.save(fileName);

        //WhatsApp message with order details
        const whatsappMessage = encodeURIComponent(
            `*Order Summary*\n Name: ${userName}\n Contact: ${userContact}\n Shop: ${shopName}\n Shop Contact: ${shopContact}\n\n*Total Products:* ${totalProducts}\n *Total Amount:* Rs ${totalAmount.toFixed(2)}\n*Note*: Please Attach order file`
        );

        // Open WhatsApp with the message
        window.open(`https://wa.me/+918602148689?text=${whatsappMessage}`, "_blank");
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={goBack} className={styles.backButton}>← Back</button>
                <h1>Order Summary</h1>
            </header>

            <div className={styles.orderList}>
                {selectedProducts.length > 0 ? (
                    selectedProducts.map((product) => (
                        <div key={product.id} className={styles.orderItem}>
                            <img src={product.productImage} alt={product.title} className={styles.productImage} />
                            <p className={styles.productTitle}>{product.title}</p>
                            <p className={styles.quantity}>Qty: {product.quantity}</p>
                            <p className={styles.price}>Rs {product.price}</p>
                            <p className={styles.totalPrice}>Rs {(product.proTotalPrice || 0).toFixed(2)}</p>
                            <button onClick={() => handleRemove(product.id)} className={styles.removeButton}>
                                <FaTrash />
                            </button>
                        </div>
                    ))
                ) : <p>No products selected.</p>}
            </div>

            <footer className={styles.footer}>
                <div className={styles.summary}>
                    <p><strong>Total Products:</strong> {selectedProducts.length}</p>
                    <p><strong>Total Amount:</strong> Rs {totalAmount.toFixed(2)}</p>
                </div>
                <button onClick={generateAndStorePDF} className={styles.whatsappButton}>
                    <FaWhatsapp /> Place Order
                </button>
            </footer>
        </div>
    );
}
